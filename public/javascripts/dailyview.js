document.addEventListener('DOMContentLoaded', () => {
    // Wait until the DOM content is fully loaded before executing the script

    const backButton = document.getElementById('back-button');
    // Get the element with id 'back-button'

    // Add click event listener to navigate to mainmenu.html
    backButton.addEventListener('click', () => {
        window.location.href = 'mainmenu.html'; // Redirect to the main menu page when the back button is clicked
    });
});
