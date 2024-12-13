document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-button');

    // Add click event listener to navigate to mainmenu.html
    backButton.addEventListener('click', () => {
        window.location.href = 'mainmenu.html'; // Redirect to main menu
    });
});
