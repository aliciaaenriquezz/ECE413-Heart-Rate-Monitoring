/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#include "Particle.h"
#line 1 "c:/Users/ual-laptop/ONEDRI~1/Desktop/413_Heart_Rate_Argon/heart_monitor/src/heart_monitor.ino"
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

void setup();
void loop();
void flashBlueLED();
void stopMeasurementRequest();
bool isInMeasurementTime();
bool takeMeasurement();
void publishData();
int setMeasurementFrequency(String frequency);
#line 6 "c:/Users/ual-laptop/ONEDRI~1/Desktop/413_Heart_Rate_Argon/heart_monitor/src/heart_monitor.ino"
MAX30105 particleSensor;

// Global variables
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;

float beatsPerMinute;
int beatAvg;

int blueLed = D7;
unsigned long lastMeasurementTime = 0;
unsigned long measurementInterval = 30 * 60 * 1000; // Default: 30 minutes
unsigned long startFlashTime = 0;
unsigned long flashDuration = 300000; // 5 minutes in milliseconds

bool measurementInProgress = false;
bool initialMeasurement = true;

int32_t pn_spo2 = -999;
int8_t pch_spo2_valid = 0;
int32_t pn_heart_rate = -999;
int8_t pch_hr_valid = 0;

uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t bufferLength = 100;

// IR threshold for finger detection
const uint32_t fingerDetectionThreshold = 50000;

void setup()
{
  Serial.begin(115200);
  pinMode(blueLed, OUTPUT);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("MAX30105 was not found. Please check wiring/power.");
    while (1);
  }
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);

  Particle.function("setFrequency", setMeasurementFrequency); // Web function to configure frequency
}

void loop()
{
  unsigned long currentMillis = millis();
  uint32_t irValue = particleSensor.getIR(); // Read IR value for finger detection

  // Finger detected at any time: take immediate measurement
  if (irValue > fingerDetectionThreshold && !measurementInProgress)
  {
    Serial.println("Finger detected. Taking measurement...");
    if (takeMeasurement())
    {
      stopMeasurementRequest(); // Stop LED if active
      return;
    }
  }

  // Initial finger request at startup
  if (initialMeasurement)
  {
    flashBlueLED();
    if (irValue > fingerDetectionThreshold)
    {
      Serial.println("Finger detected. Taking initial measurement...");
      if (takeMeasurement())
      {
        initialMeasurement = false;
        stopMeasurementRequest();
      }
    }
    return;
  }

  // Periodic measurement request between 6:00 AM and 10:00 PM
  if (isInMeasurementTime() && (currentMillis - lastMeasurementTime >= measurementInterval) && !measurementInProgress)
  {
    measurementInProgress = true;
    startFlashTime = millis();
    flashBlueLED();
  }

  // Handle the ongoing measurement request
  if (measurementInProgress)
  {
    // Stop the LED and reset if no measurement is taken within 5 minutes
    if (currentMillis - startFlashTime >= flashDuration)
    {
      stopMeasurementRequest();
      return;
    }

    // Attempt measurement if finger is detected
    if (irValue > fingerDetectionThreshold)
    {
      Serial.println("Finger detected. Taking periodic measurement...");
      if (takeMeasurement())
      {
        stopMeasurementRequest();
      }
    }
  }
}

// Function to flash the blue LED
void flashBlueLED()
{
  static bool ledState = false;
  static unsigned long lastFlashTime = 0;
  const unsigned long flashInterval = 500; // LED flashes every 500 ms

  if (millis() - lastFlashTime >= flashInterval)
  {
    ledState = !ledState;
    digitalWrite(blueLed, ledState ? HIGH : LOW);
    lastFlashTime = millis();
  }
}

// Stop flashing and reset measurement request
void stopMeasurementRequest()
{
  measurementInProgress = false;
  lastMeasurementTime = millis();
  digitalWrite(blueLed, LOW); // Turn off the LED
}

// Function to check if it's time for a measurement (6:00 AM - 10:00 PM)
bool isInMeasurementTime()
{
  Time.zone(0); // Adjust for your timezone
  int hour = Time.hour();
  return (hour >= 6 && hour < 22); // Between 6:00 AM and 10:00 PM
}

// Function to take measurement
bool takeMeasurement()
{
  for (int i = 0; i < bufferLength; i++)
  {
    while (particleSensor.available() == false)
      particleSensor.check();

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();
  }

  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &pn_spo2, &pch_spo2_valid, &pn_heart_rate, &pch_hr_valid);

  if (pch_hr_valid == 1 && pch_spo2_valid == 1)
  {
    // Publish data to webhooks
    publishData();
    return true;
  }
  return false; // Measurement not valid
}

// Function to publish data via webhooks
void publishData()
{
  String temp1 = String(pn_heart_rate);
  String temp2 = String(pn_spo2);

  Particle.publish("Heart Rate", "{\"Heart Rate\":" + temp1 + "}", PRIVATE);
  delay(1000);
  Particle.publish("Blood Oxygen Saturation", "{\"Blood Oxygen Saturation\":" + temp2 + "}", PRIVATE);
  delay(1000);
}

// Function to set measurement frequency via Particle.function()
int setMeasurementFrequency(String frequency)
{
  int newFrequency = frequency.toInt(); // Parse frequency in minutes
  if (newFrequency >= 5 && newFrequency <= 120) // Allow 5 to 120 minutes
  {
    measurementInterval = newFrequency * 60 * 1000;
    return 1; // Success
  }
  return -1; // Invalid input
}
