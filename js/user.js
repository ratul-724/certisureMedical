document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        userTableBody: document.getElementById('userTableBody'),
        logoutLink: document.getElementById('logout'),
        registerSection: document.getElementById('register'),
        userListSection: document.getElementById('userList'),
        // Modal elements
        editModal: document.getElementById('editModal'),
        editAgentName: document.getElementById('editAgentName'),
        editPassword: document.getElementById('editPassword'),
        editRole: document.getElementById('editRole'),
        saveChangesBtn: document.getElementById('saveChangesBtn'),
        closeModalBtn: document.querySelector('.close-modal')
    };

    // State Management
    const state = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        loggedInUser: JSON.parse(localStorage.getItem('loggedInUser')),
        apiBaseUrl: 'http://localhost/certisureMedical/backend/',
        currentEditUser: null
    };

    // Initialize the application
    initApp();

    // ==================== Core Functions ====================

    function initApp() {
        ensureAdminExists();
        updateUI();
        setupEventListeners();
        if (state.loggedInUser?.role === 'admin') loadUserList();
    }

    function ensureAdminExists() {
        const hasAdmin = state.users.some(user => user.role === 'admin');
        if (!hasAdmin) {
            const adminUser = { 
                agentName: 'Alihossen', 
                password: 'Ams@Admin@1234', 
                role: 'admin' 
            };
            state.users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(state.users));
            
            apiRequest('register.php', 'POST', adminUser)
                .then(handleAdminCreationResponse);
        }
    }

    function updateUI() {
        elements.logoutLink.style.display = state.loggedInUser ? 'block' : 'none';
        if (state.loggedInUser?.role === 'admin') {
            elements.registerSection.style.display = 'block';
            elements.userListSection.style.display = 'block';
        }
    }

    function setupEventListeners() {
        elements.loginForm?.addEventListener('submit', handleLogin);
        elements.registerForm?.addEventListener('submit', handleRegister);
        elements.logoutLink?.addEventListener('click', handleLogout);
        elements.saveChangesBtn?.addEventListener('click', saveUserChanges);
        elements.closeModalBtn?.addEventListener('click', closeEditModal);
    }

    // ==================== Modal Functions ====================

    function openEditModal(user) {
        state.currentEditUser = user;
        elements.editAgentName.value = user.agentName;
        elements.editPassword.value = user.password;
        elements.editRole.value = user.role;
        elements.editModal.style.display = 'block';
    }

    function closeEditModal() {
        elements.editModal.style.display = 'none';
        state.currentEditUser = null;
    }

    async function saveUserChanges() {
        const updates = {
            currentAgentName: state.currentEditUser.agentName,
            agentName: elements.editAgentName.value,
            password: elements.editPassword.value,
            role: elements.editRole.value
        };

        if (!updates.agentName || !updates.password || !updates.role) {
            alert('All fields are required');
            return;
        }

        const response = await apiRequest('editUser.php', 'POST', updates);
        alert(response.message);
        if (response.success) {
            const index = state.users.findIndex(u => u.agentName === state.currentEditUser.agentName);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...updates };
                localStorage.setItem('users', JSON.stringify(state.users));
            }
            loadUserList();
            closeEditModal();
        }
    }

    // ==================== Event Handlers ====================

    async function handleLogin(event) {
        event.preventDefault();
        
        const credentials = {
            agentName: document.getElementById('loginAgentName').value,
            password: document.getElementById('loginPassword').value
        };

        const users = await apiRequest('userList.php', 'GET');
        const user = users?.find(u => 
            u.agentName === credentials.agentName && 
            u.password === credentials.password
        );

        if (user) {
            state.loggedInUser = user;
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        
        const newUser = {
            agentName: document.getElementById('registerAgentName').value,
            password: document.getElementById('registerPassword').value,
            role: 'user'
        };

        apiRequest('register.php', 'POST', newUser)
            .then(data => {
                alert(data.message);
                if (data.success) {
                    state.users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(state.users));
                    loadUserList();
                }
            });
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'user.html';
        }
    }

    // ==================== User Management ====================

    function loadUserList() {
        apiRequest('userList.php', 'GET')
            .then(users => {
                elements.userTableBody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.agentName}</td>
                        <td>${user.role}</td>
                        <td>
                            <button onclick="editUser('${user.agentName}')" class="btn btn-success mx-md-4 rounded-5 z-2">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="removeUser('${user.agentName}', '${user.role}')" class="btn btn-danger rounded-5">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>`
                ).join('');
            });
    }

    window.editUser = async function(agentName) {
        const users = await apiRequest('userList.php', 'GET');
        const user = users?.find(u => u.agentName === agentName);
        
        if (!user) {
            alert('User not found');
            return;
        }

        openEditModal(user);
    };

    window.removeUser = function(agentName, role) {
        if (role === 'admin') return alert("Admin user cannot be deleted.");
        if (!confirm("Are you sure you want to remove this user?")) return;

        apiRequest('removeUser.php', 'POST', { agentName })
            .then(data => {
                alert(data.message);
                if (data.success) {
                    state.users = state.users.filter(u => u.agentName !== agentName);
                    localStorage.setItem('users', JSON.stringify(state.users));
                    loadUserList();
                }
            });
    };

    // ==================== Helper Functions ====================

    async function apiRequest(endpoint, method, data = {}) {
        try {
            const response = await fetch(state.apiBaseUrl + endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'GET' ? JSON.stringify(data) : null
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            alert('An error occurred. Please try again.');
            return { success: false, message: 'API request failed' };
        }
    }

    function handleAdminCreationResponse(data) {
        if (!data.success) {
            console.error('Admin creation failed:', data.message);
        }
    }
});

// Password visibility toggle
function togglePasswordVisibility(passwordId, toggleIconId) {
    const passwordField = document.getElementById(passwordId);
    const toggleIcon = document.getElementById(toggleIconId);
    passwordField.type = passwordField.type === "password" ? "text" : "password";
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
}