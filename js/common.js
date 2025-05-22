let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const welcomeNameElement = document.getElementById('welcomeName');

// Display logged-in user's name
if (loggedInUser && loggedInUser.agentName) {
    welcomeNameElement.textContent = loggedInUser.agentName;
} else {
    welcomeNameElement.textContent = "Guest"; // Default if no user is logged in    
}

document.addEventListener('DOMContentLoaded', () => {
    // Get the logged-in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // Check if the user is an admin
        if (loggedInUser.role === 'admin') {
            // Change the user icon to an admin-specific image
            const userIcon = document.getElementById('userIcon');
            const userIconSidebar = document.getElementById('userIconSidebar');
            const reportEntry = document.getElementById('reportEntry');
            userIcon.src = 'media/icons/ali.jpg'; // Path to the admin icon
            userIconSidebar.src = 'media/icons/ali.jpg'; // Path to the admin icon
            reportEntry.style.display = 'block'; // Show the report entry button
        }
    } 
});

document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

    // Apply dark mode if it was enabled
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for light mode
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');

        // Save the user's preference in localStorage
        if (isDarkMode) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for light mode
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for dark mode
        }
    });
});