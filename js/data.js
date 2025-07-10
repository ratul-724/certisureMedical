document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'user.html';
        return;
    }

    // Set welcome message
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        welcomeName.textContent = loggedInUser.username || loggedInUser.agentName || 'User';
    }

    // DOM elements
    const elements = {
        dataDisplay: document.getElementById('dataDisplay'),
        clearPageButton: document.getElementById('clearPage'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        monthYearFilterBtn: document.getElementById('monthYearFilterBtn'),
        dataPageTopBtns: document.getElementById('dataPageTopBtns')
    };

    const API_BASE_URL = 'http://localhost/certisureMedical/backend/';
    let allData = [];
    let currentDisplayedData = [];

    // Set admin controls visibility
    if (loggedInUser.role === 'admin') {
        if (elements.dataPageTopBtns) elements.dataPageTopBtns.style.display = 'flex';
        if (elements.monthYearFilterBtn) elements.monthYearFilterBtn.style.display = 'block';
        if (elements.clearPageButton) elements.clearPageButton.style.display = 'block';
    } else {
        if (elements.dataPageTopBtns) elements.dataPageTopBtns.style.display = 'none';
        if (elements.monthYearFilterBtn) elements.monthYearFilterBtn.style.display = 'none';
        if (elements.clearPageButton) elements.clearPageButton.style.display = 'none';
    }

    // Main function to fetch and display data
    const fetchDataAndRender = async () => {
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
        try {
            const data = await fetchData('getSubmittedData.php', loggedInUser);
            if (data) {
                allData = data;
                if (loggedInUser.role === 'admin') {
                    filterByCurrentMonth(); // Admin sees current month by default
                } else {
                    renderTable(allData); // Regular users see all data
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data. Please check console for details.');
        } finally {
            if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        }
    };

    // API fetch helper
    const fetchData = async (endpoint, body) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') || ''
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    };

    // Render table with data (ORIGINAL STYLING PRESERVED)
    const renderTable = (data) => {
        currentDisplayedData = data; // Store currently displayed data
        if (!elements.dataDisplay) return;
        elements.dataDisplay.innerHTML = '';
        if (data?.length > 0) {
            const table = document.createElement('table');
            table.className = 'table table-bordered table-striped'; // Original classes
            
            // Create header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['SL', 'medical_Name', 'date', 'id', 'name', 'passport', 'agent', 'status', 'remarks'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text.charAt(0).toUpperCase() + text.slice(1);
                headerRow.appendChild(th);
            });
            if (loggedInUser.role === 'admin') {
                const actionsTh = document.createElement('th');
                actionsTh.textContent = 'Actions';
                headerRow.appendChild(actionsTh);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create body
            const tbody = document.createElement('tbody');
            data.sort((a, b) => new Date(a.date) - new Date(b.date))
               .forEach((row, index) => {
                   const tr = document.createElement('tr');
                   tr.setAttribute('data-id', row.id);
                   
                   // Serial number
                   const slTd = document.createElement('td');
                   slTd.textContent = index + 1;
                   tr.appendChild(slTd);
                   
                   // Data cells
                   ['medical_name', 'date', 'id', 'name', 'passport', 'agent', 'laboratory', 'remarks'].forEach(key => {
                       const td = document.createElement('td');
                       let content = row[key] || '';
                       if (['laboratory', 'remarks'].includes(key)) {
                           content = content.toUpperCase();
                           if (content === 'UNFIT') {
                               td.style.backgroundColor = 'red';
                               td.style.color = 'white';
                           }
                       }
                       td.textContent = content;
                       tr.appendChild(td);
                   });
                   
                   // Actions for admin
                   if (loggedInUser.role === 'admin') {
                       const actionsTd = document.createElement('td');
                       
                       const editBtn = document.createElement('button');
                       editBtn.className = 'btn btn-warning btn-sm me-1';
                       editBtn.innerHTML = '<i class="fa-solid fa-edit" title="Edit this row"></i>';
                       editBtn.addEventListener('click', () => handleEdit(row));
                       actionsTd.appendChild(editBtn);
                       
                       const deleteBtn = document.createElement('button');
                       deleteBtn.className = 'btn btn-danger btn-sm';
                       deleteBtn.innerHTML = '<i class="fa-solid fa-trash" title="Delete this row"></i>';
                       deleteBtn.addEventListener('click', () => handleDelete(row.id));
                       actionsTd.appendChild(deleteBtn);
                       
                       tr.appendChild(actionsTd);
                   }
                   
                   tbody.appendChild(tr);
               });
            table.appendChild(tbody);
            elements.dataDisplay.appendChild(table);
        } else {
            elements.dataDisplay.innerHTML = '<p>No data available.</p>';
        }
    };

    // ADMIN-ONLY MONTH/YEAR FILTERING (FUNCTIONAL FIXES ONLY)
    const initializeMonthYearFilter = () => {
        const currentDate = new Date();
        const yearSelect = document.getElementById('yearFilter');
        
        // Set current month
        document.getElementById('monthFilter').value = currentDate.getMonth() + 1;
        
        // Populate years
        yearSelect.innerHTML = '';
        const currentYear = currentDate.getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentYear;
        
        document.getElementById('applyMonthYearFilter').addEventListener('click', () => {
            const month = parseInt(document.getElementById('monthFilter').value);
            const year = parseInt(document.getElementById('yearFilter').value);
            applyMonthFilter(month, year);
        });

        // Add event listener for "All Data" button
        document.getElementById('showAllData').addEventListener('click', () => {
            renderTable(allData);
            const dropdown = bootstrap.Dropdown.getInstance(elements.monthYearFilterBtn);
            if (dropdown) dropdown.hide();
        });
    };

    const filterByCurrentMonth = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        document.getElementById('monthFilter').value = currentMonth;
        document.getElementById('yearFilter').value = currentYear;
        
        applyMonthFilter(currentMonth, currentYear);
    };

    const applyMonthFilter = (month, year) => {
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
        
        const filteredData = allData.filter(item => {
            if (!item.date) return false;
            const itemDate = new Date(item.date);
            return itemDate.getMonth() + 1 === month && itemDate.getFullYear() === year;
        });
        
        renderTable(filteredData);
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        
        // Close dropdown
        const dropdown = bootstrap.Dropdown.getInstance(elements.monthYearFilterBtn);
        if (dropdown) dropdown.hide();
    };

    // Edit/Delete handlers (ORIGINAL IMPLEMENTATION)
    const handleEdit = (rowData) => {
        const row = event.target.closest('tr');
        const cells = row.querySelectorAll('td');
        const originalData = { ...rowData };
        
        for (let i = 1; i < cells.length - 1; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control form-control-sm border border-secondary';
            input.value = cells[i].textContent;
            cells[i].textContent = '';
            cells[i].appendChild(input);
        }
        
        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
        saveButton.title = 'Save';
        saveButton.className = 'btn btn-success btn-sm me-1';
        saveButton.addEventListener('click', () => handleSave(row, originalData));

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fa-solid fa-xmark" title="Cancel"></i>';
        cancelButton.title = 'Cancel';
        cancelButton.className = 'btn btn-danger btn-sm';
        cancelButton.addEventListener('click', () => handleCancel(row, originalData));

        const actionCell = cells[cells.length - 1];
        actionCell.innerHTML = '';
        actionCell.appendChild(saveButton);
        actionCell.appendChild(cancelButton);
    };

    const handleSave = async (row, originalData) => {
        const rowId = row.getAttribute('data-id');
        if (!rowId) {
            alert("Error: Row ID is missing!");
            return;
        }
        const cells = row.querySelectorAll('td');
        const updatedData = { ...originalData, id: rowId };
        
        for (let i = 1; i < cells.length - 1; i++) {
            const key = Object.keys(originalData)[i - 1];
            const input = cells[i].querySelector('input');
            if (input) updatedData[key] = input.value.trim();
        }
        
        try {
            const response = await fetchData('updateData.php', updatedData);
            if (response?.status === 'success') {
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update data');
        }
    };

    const handleCancel = (row, originalData) => {
        const cells = row.querySelectorAll('td');
        for (let i = 1; i < cells.length - 1; i++) {
            const key = Object.keys(originalData)[i - 1];
            cells[i].textContent = originalData[key];
        }
        
        const actionCell = cells[cells.length - 1];
        actionCell.innerHTML = '';
        actionCell.appendChild(createEditButton(originalData));
        actionCell.appendChild(createDeleteButton(originalData));
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                const response = await fetchData('deleteData.php', { id, section: 'submitted' });
                if (response?.status === 'success') {
                    fetchDataAndRender();
                } else {
                    alert(response?.message || 'Deletion failed');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete data');
            }
        }
    };

    // Helper functions for action buttons
    const createEditButton = (rowData) => {
        const button = document.createElement('button');
        button.className = 'btn btn-warning btn-sm me-1';
        button.innerHTML = '<i class="fa-solid fa-edit" title="Edit this row"></i>';
        button.addEventListener('click', () => handleEdit(rowData));
        return button;
    };

    const createDeleteButton = (rowData) => {
        const button = document.createElement('button');
        button.className = 'btn btn-danger btn-sm';
        button.innerHTML = '<i class="fa-solid fa-trash" title="Delete this row"></i>';
        button.addEventListener('click', () => handleDelete(rowData.id));
        return button;
    };

    // Clear page button (admin only) - MODIFIED TO DELETE ONLY DISPLAYED DATA
    if (loggedInUser.role === 'admin' && elements.clearPageButton) {
        elements.clearPageButton.addEventListener('click', async () => {
            if (currentDisplayedData.length === 0) {
                alert('No data to delete');
                return;
            }

            if (confirm(`Are you sure you want to delete ${currentDisplayedData.length} displayed reports?`)) {
                if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
                
                try {
                    // Delete all displayed records one by one
                    for (const record of currentDisplayedData) {
                        const response = await fetchData('deleteData.php', { 
                            id: record.id, 
                            section: 'submitted' 
                        });
                        
                        if (response?.status !== 'success') {
                            throw new Error(response?.message || 'Failed to delete some records');
                        }
                    }
                    
                    // Refresh data after deletion
                    await fetchDataAndRender();
                    alert(`${currentDisplayedData.length} reports deleted successfully`);
                } catch (error) {
                    console.error('Clear displayed data error:', error);
                    alert('Error deleting some records. Please check console for details.');
                } finally {
                    if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
                }
            }
        });
    }

    // Search functionality (ORIGINAL IMPLEMENTATION)
    function initializeSearch() {
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await performSearch();
            });
        }

        const resetSearch = document.getElementById('resetSearch');
        if (resetSearch) {
            resetSearch.addEventListener('click', function() {
                resetSearchForm();
                if (loggedInUser.role === 'admin') {
                    filterByCurrentMonth();
                } else {
                    renderTable(allData);
                }
            });
        }
    }

    async function performSearch() {
        const medical = document.getElementById('medicalSearch')?.value;
        const agent = document.getElementById('agent')?.value;
        const namePassport = document.getElementById('nameSearch')?.value.trim();
        const startDate = document.getElementById('startDateSearch')?.value;
        const endDate = document.getElementById('endDateSearch')?.value;

        if (!medical && !agent && !namePassport && !startDate && !endDate) {
            return alert('Please provide at least one search criteria');
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return alert('End date must be after start date');
        }

        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
        
        try {
            const filteredData = allData.filter(item => {
                let matches = true;
                
                if (medical && item.medical_name !== medical) matches = false;
                if (agent && item.agent !== agent) matches = false;
                
                if (namePassport) {
                    const term = namePassport.toLowerCase();
                    if (!item.name?.toLowerCase().includes(term) && 
                        !item.passport?.toLowerCase().includes(term)) {
                        matches = false;
                    }
                }
                
                if (startDate || endDate) {
                    const itemDate = new Date(item.date);
                    if (startDate && itemDate < new Date(startDate)) matches = false;
                    if (endDate && itemDate > new Date(endDate)) matches = false;
                }
                
                return matches;
            });

            renderTable(filteredData);
            
            const dropdownBtn = document.getElementById('searchDropdownBtn');
            if (dropdownBtn) {
                const dropdown = bootstrap.Dropdown.getInstance(dropdownBtn);
                if (dropdown) dropdown.hide();
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed');
        } finally {
            if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        }
    }

    function resetSearchForm() {
        const medicalSearch = document.getElementById('medicalSearch');
        const agentSearch = document.getElementById('agent');
        const nameSearch = document.getElementById('nameSearch');
        const startDateSearch = document.getElementById('startDateSearch');
        const endDateSearch = document.getElementById('endDateSearch');
        
        if (medicalSearch) medicalSearch.value = '';
        if (agentSearch) agentSearch.value = '';
        if (nameSearch) nameSearch.value = '';
        if (startDateSearch) startDateSearch.value = '';
        if (endDateSearch) endDateSearch.value = '';
    }

    // Initialize page
    fetchDataAndRender();
    if (loggedInUser.role === 'admin') {
        initializeMonthYearFilter();
    }
    initializeSearch();
});