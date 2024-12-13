document.addEventListener('DOMContentLoaded', () => {
});
function navigateTo(pageKey) {
    // Define the mapping between page keys and their corresponding HTML files
    const pageMap = {
        'weeklySummary': 'weeklyview.html',
        'dailyDetail': 'dailyview.html',
        'manageDevices': 'managedevices.html',
        'updateAccount': 'updateaccount.html'
    };

    // Check if the pageKey exists in the map
    if (pageMap[pageKey]) {
        // Redirect to the corresponding page
        window.location.href = pageMap[pageKey];
    } else {
        console.error(`Page key "${pageKey}" not found in page map.`);
    }
}