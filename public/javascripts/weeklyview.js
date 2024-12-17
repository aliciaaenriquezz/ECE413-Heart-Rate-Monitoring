document.addEventListener('DOMContentLoaded', () => {
    // Get the back button element by its ID
    const backButton = document.getElementById('back-button');

    // Add a click event listener to the back button
    backButton.addEventListener('click', () => {
        // Redirect to the main menu page when the back button is clicked
        window.location.href = 'mainmenu.html';
    });
});
