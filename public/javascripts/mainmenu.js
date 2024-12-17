document.addEventListener('DOMContentLoaded', () => {
    // This event listener waits until the DOM content is fully loaded.
    // No additional functionality is implemented inside this block.
});

function navigateTo(pageKey) {
    // Define the mapping between page keys and their corresponding HTML files
    const pageMap = {
        'weeklySummary': 'weeklyview.html',  // Maps 'weeklySummary' to 'weeklyview.html'
        'dailyDetail': 'dailyview.html',    // Maps 'dailyDetail' to 'dailyview.html'
        'manageDevices': 'managedevices.html', // Maps 'manageDevices' to 'managedevices.html'
        'updateAccount': 'updateaccount.html' // Maps 'updateAccount' to 'updateaccount.html'
    };

    // Check if the pageKey exists in the pageMap
    if (pageMap[pageKey]) {
        // If the pageKey is found in the map, redirect to the corresponding HTML page
        window.location.href = pageMap[pageKey];
    } else {
        // If the pageKey is not found, log an error to the console
        console.error(`Page key "${pageKey}" not found in page map.`);
    }
}
