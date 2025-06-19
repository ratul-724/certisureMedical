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


    

  // Load agents when page loads
  loadAgents();
  // Also load when user navigates back (for cached pages)
  window.addEventListener('pageshow', loadAgents);

  async function loadAgents() {
    try {
        const response = await fetch('http://localhost/certisureMedical/backend/userList.php');
        const users = await response.json();
        const agentSelect = document.getElementById('agent');
        // Clear existing options except the first one
        while (agentSelect.options.length > 1) {
            agentSelect.remove(1);
        }
        // Add all users as options
        users.forEach(user => {
            const option = document.createElement('option');
            option.textContent = user.agentName;
            agentSelect.appendChild(option);
        });
        
        // If logged in user is not admin, set their name as default
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.role !== 'admin') {
            agentSelect.disabled = true; // Non-admins can't change agent
        }
        
        } catch (error) {
            console.error('Error loading agents:', error);
            // Fallback to manual input if API fails
            const agentSelect = document.getElementById('agent');
            agentSelect.innerHTML = `
                <option value="" disabled selected>Select Agent</option>
                <option value="manual">Enter Manually</option>
            `;
            agentSelect.addEventListener('change', function() {
                if (this.value === 'manual') {
                    const manualName = prompt('Enter Agent Name:');
                    if (manualName) {
                        const newOption = document.createElement('option');
                        newOption.textContent = manualName;
                        this.add(newOption);
                    }
                }
            });
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