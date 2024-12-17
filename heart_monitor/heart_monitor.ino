#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;  // Create a MAX30105 object to interact with the sensor

// Global variables
const byte RATE_SIZE = 4;  // Number of heart rate samples for averaging
byte rates[RATE_SIZE];  // Array to store heart rate values
byte rateSpot = 0;  // Current position in the array
long lastBeat = 0;  // Timestamp of the last heart rate beat

float beatsPerMinute;  // Calculated beats per minute
int beatAvg;  // Average heart rate

int blueLed = D7;  // Pin for the blue LED
unsigned long lastMeasurementTime = 0;  // Timestamp of the last measurement
unsigned long measurementInterval = 30 * 60 * 1000;  // Default measurement interval: 30 minutes
unsigned long startFlashTime = 0;  // Timestamp when flashing starts
unsigned long flashDuration = 300000;  // Flash duration in milliseconds (5 minutes)

unsigned long last30MinFlashTime = 0;  // Timestamp of the last 30-minute flash
const unsigned long thirtyMinInterval = 30 * 60 * 1000;  // 30-minute interval
bool flashingFor30Min = false;  // Flag to track if LED is flashing for 30-minute period

bool measurementInProgress = false;  // Flag to track ongoing measurement
bool initialMeasurement = true;  // Flag for the initial measurement

int32_t pn_spo2 = -999;  // Blood oxygen saturation value
int8_t pch_spo2_valid = 0;  // Validity flag for SPO2 value
int32_t pn_heart_rate = -999;  // Heart rate value
int8_t pch_hr_valid = 0;  // Validity flag for heart rate value

uint32_t irBuffer[100];  // Buffer for IR light data
uint32_t redBuffer[100];  // Buffer for red light data
int32_t bufferLength = 100;  // Buffer length

// IR threshold for detecting a finger
const uint32_t fingerDetectionThreshold = 50000;  // IR value threshold for finger detection

void setup()
{
  Serial.begin(115200);  // Start serial communication at 115200 baud rate
  pinMode(blueLed, OUTPUT);  // Set blue LED pin as output

  // Initialize the MAX30105 sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30105 was not found. Please check wiring/power.");
    while (1);  // Halt execution if sensor initialization fails
  }
  particleSensor.setup();  // Set up the sensor
  particleSensor.setPulseAmplitudeRed(0x0A);  // Set red LED amplitude
  particleSensor.setPulseAmplitudeGreen(0);  // Set green LED amplitude

  // Expose the setFrequency function to the Particle Cloud
  Particle.function("setFrequency", setMeasurementFrequency); 
}

void loop()
{
  unsigned long currentMillis = millis();  // Get the current time in milliseconds
  uint32_t irValue = particleSensor.getIR();  // Read the IR value from the sensor to detect the finger

  // Handle 30-minute periodic LED flashing
  if (!flashingFor30Min && currentMillis - last30MinFlashTime >= thirtyMinInterval) {
    Serial.println("30-minute interval reached. Starting LED flash...");
    flashingFor30Min = true;  // Start flashing
    last30MinFlashTime = currentMillis;  // Update the last flash time
    startFlashTime = currentMillis;  // Mark the start of flashing
  }

  // Flash LED continuously until finger is detected
  if (flashingFor30Min) {
    flashBlueLED();  // Flash the blue LED

    if (irValue > fingerDetectionThreshold) {  // If a finger is detected (IR value exceeds threshold)
      Serial.println("Finger detected during 30-minute flash. Taking measurement...");
      flashingFor30Min = false;  // Stop flashing the LED
      digitalWrite(blueLed, LOW);  // Turn off the blue LED

      if (takeMeasurement()) {  // If measurement is successfully taken
        stopMeasurementRequest();  // Stop the measurement request
        return;
      }
    }

    // Stop flashing if no finger is detected for 5 minutes
    if (currentMillis - startFlashTime >= flashDuration) {
      Serial.println("Timeout: Stopping LED flash after prolonged period.");
      flashingFor30Min = false;  // Stop flashing the LED
      digitalWrite(blueLed, LOW);  // Turn off the blue LED
    }
  }

  // Finger detected at any time: take immediate measurement
  if (irValue > fingerDetectionThreshold && !measurementInProgress) {
    Serial.println("Finger detected. Taking measurement...");
    if (takeMeasurement()) {  // Take measurement if finger detected
      stopMeasurementRequest();  // Stop the measurement request
      return;
    }
  }

  // Initial finger detection at startup
  if (initialMeasurement) {
    flashBlueLED();  // Flash the blue LED
    if (irValue > fingerDetectionThreshold) {  // If a finger is detected
      Serial.println("Finger detected. Taking initial measurement...");
      if (takeMeasurement()) {  // Take the initial measurement
        initialMeasurement = false;  // Set flag to false after initial measurement
        stopMeasurementRequest();  // Stop the measurement request
      }
    }
    return;  // Return early if no initial measurement has been taken
  }

  // Periodic measurement request between 6:00 AM and 10:00 PM
  if (isInMeasurementTime() && (currentMillis - lastMeasurementTime >= measurementInterval) && !measurementInProgress) {
    measurementInProgress = true;  // Set flag indicating measurement is in progress
    startFlashTime = millis();  // Mark the start of the measurement period
    flashBlueLED();  // Start flashing the LED to indicate measurement
  }

  // Handle the ongoing measurement request
  if (measurementInProgress) {
    // Stop the LED and reset if no measurement is taken within 5 minutes
    if (currentMillis - startFlashTime >= flashDuration) {
      stopMeasurementRequest();  // Stop the measurement request
      return;
    }

    // Attempt measurement if finger is detected
    if (irValue > fingerDetectionThreshold) {
      Serial.println("Finger detected. Taking periodic measurement...");
      if (takeMeasurement()) {  // Take the measurement if finger is detected
        stopMeasurementRequest();  // Stop the measurement request
      }
    }
  }
}

// Function to flash the blue LED
void flashBlueLED()
{
  static bool ledState = false;  // Variable to track the LED state
  static unsigned long lastFlashTime = 0;  // Timestamp of the last flash
  const unsigned long flashInterval = 500;  // Flash the LED every 500 milliseconds

  // Toggle LED state every flashInterval milliseconds
  if (millis() - lastFlashTime >= flashInterval) {
    ledState = !ledState;  // Toggle the LED state
    digitalWrite(blueLed, ledState ? HIGH : LOW);  // Set the LED to the new state
    lastFlashTime = millis();  // Update the last flash timestamp
  }
}

// Stop flashing the LED and reset the measurement request
void stopMeasurementRequest()
{
  measurementInProgress = false;  // Reset the measurement flag
  lastMeasurementTime = millis();  // Set the timestamp of the last measurement
  digitalWrite(blueLed, LOW);  // Turn off the blue LED
}

// Function to check if the current time is within the measurement window (6:00 AM - 10:00 PM)
bool isInMeasurementTime()
{
  Time.zone(0);  // Adjust time zone (UTC)
  int hour = Time.hour();  // Get the current hour
  return (hour >= 6 && hour < 22);  // Return true if current time is between 6:00 AM and 10:00 PM
}

// Function to take a measurement from the MAX30105 sensor
bool takeMeasurement()
{
  for (int i = 0; i < bufferLength; i++) {
    // Collect data from the sensor until the buffer is full
    while (particleSensor.available() == false)  // Wait for data to be available
      particleSensor.check();
    
    redBuffer[i] = particleSensor.getRed();  // Read red light data
    irBuffer[i] = particleSensor.getIR();  // Read IR light data
    particleSensor.nextSample();  // Move to the next sample
  }

  // Process the collected data to calculate heart rate and SPO2
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &pn_spo2, &pch_spo2_valid, &pn_heart_rate, &pch_hr_valid);

  // If valid heart rate and SPO2 values are obtained, publish the data
  if (pch_hr_valid == 1 && pch_spo2_valid == 1) {
    publishData();  // Publish the data to Particle Cloud
    return true;  // Measurement successful
  }
  return false;  // Measurement not valid
}

// Function to publish the heart rate and SPO2 data via webhooks
void publishData()
{
  String temp1 = String(pn_heart_rate);  // Convert heart rate value to string
  String temp2 = String(pn_spo2);  // Convert SPO2 value to string

  // Publish data to Particle Cloud
  Particle.publish("Heart Rate", "{\"Heart Rate\":" + temp1 + "}", PRIVATE);
  delay(1000);  // Wait for 1 second before publishing the next value
  Particle.publish("Blood Oxygen Saturation", "{\"Blood Oxygen Saturation\":" + temp2 + "}", PRIVATE);
  delay(1000);  // Wait for 1 second before completing
}

// Function to set the measurement frequency via Particle.function()
int setMeasurementFrequency(String frequency)
{
  int newFrequency = frequency.toInt();  // Convert the input string to an integer
  if (newFrequency >= 5 && newFrequency <= 120) {  // Check if the frequency is within the allowed range (5 to 120 minutes)
    measurementInterval = newFrequency * 60 * 1000;  // Set the new measurement interval in milliseconds
    return 1;  // Success
  }
  return -1;  // Invalid input
}
