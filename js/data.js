document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'user.html';
        return;
    }
    
    const dataPageTopBtns = document.getElementById('dataPageTopBtns');
    if (loggedInUser.role === 'admin') {
        dataPageTopBtns.style.display = 'flex';
        dataPageTopBtns.style.flexWrap = 'nowrap';
    } else {
        dataPageTopBtns.style.display = 'none';
    }

    const elements = {
        dataDisplay: document.getElementById('dataDisplay'),
        submittedReportsButton: document.getElementById('submittedReports'),
        uploadDataButton: document.getElementById('uploadData'),
        clearPageButton: document.getElementById('clearPage'),
        loadingSpinner: document.getElementById('loadingSpinner')
    };
    
    const API_BASE_URL = 'http://localhost/certisureMedical/backend/';

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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            alert(error.message, 'error');
            return null;
        }
    };

    const renderTable = (data) => {
        elements.dataDisplay.innerHTML = ''; // Clear previous content
        if (data.length > 0) {
            const table = createTable(data, loggedInUser.role === 'admin');
            elements.dataDisplay.appendChild(table);
        } else {
            elements.dataDisplay.innerHTML = '<p>No data available.</p>';
        }
    };

    const createTable = (data, isAdmin) => {
        const table = document.createElement('table');
        table.classList.add('table', 'table-bordered', 'table-striped');
        table.appendChild(createTableHeader(isAdmin));
        table.appendChild(createTableBody(data, isAdmin));
        return table;
    };

    const createTableHeader = (isAdmin) => {
        const headers = ['SL', 'medical_name', 'date', 'id', 'name', 'passport', 'agent', 'status', 'remarks'];
        const headerRow = document.createElement('tr');
        headers.forEach(header => headerRow.appendChild(createHeaderCell(header)));
        if (isAdmin) headerRow.appendChild(createHeaderCell('Actions'));
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        return thead;
    };

    const createHeaderCell = (text) => {
        const th = document.createElement('th');
        th.textContent = text.charAt(0).toUpperCase() + text.slice(1);
        return th;
    };

    const createTableBody = (data, isAdmin) => {
        const tbody = document.createElement('tbody');
        data.sort((a, b) => new Date(a.date) - new Date(b.date))
           .forEach((row, index) => tbody.appendChild(createTableRow(row, isAdmin, index)));
        return tbody;
    };

    const createTableCell = (content, key) => {
        const td = document.createElement('td');
        if (['laboratory', 'remarks'].includes(key)) {
            content = content.toUpperCase();
        }
        td.textContent = content || '';
        if (['laboratory', 'remarks'].includes(key) && content === 'UNFIT') {
            td.style.backgroundColor = 'red';
            td.style.color = 'white';
        }
        return td;
    };

    const createTableRow = (rowData, isAdmin, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', rowData.id);
        
        // Add serial number cell
        const serialCell = document.createElement('td');
        serialCell.textContent = index + 1;
        row.appendChild(serialCell);
        
        const isUnfit = ['laboratory', 'remarks'].some(
            key => rowData[key]?.toUpperCase() === 'UNFIT'
        );
        if (isUnfit) {
            row.style.backgroundColor = 'red';
            row.style.color = 'white';
        }
        
        // Add other cells
        Object.keys(rowData).forEach(key => {
            const cell = createTableCell(rowData[key], key);
            row.appendChild(cell);
        });
        
        if (isAdmin) {
            const actionCell = createActionCell(rowData);
            row.appendChild(actionCell);
        }
        return row;
    };

    const createActionCell = (rowData) => {
        const actionTd = document.createElement('td');
        actionTd.appendChild(createEditButton(rowData));
        actionTd.appendChild(createDeleteButton(rowData));
        return actionTd;
    };

    const createEditButton = (rowData) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-warning', 'btn-sm', 'me-1');
        button.innerHTML = '<i class="fa-solid fa-edit" title="Edit this row"></i>';
        button.addEventListener('click', () => handleEdit(rowData));
        return button;
    };

    const createDeleteButton = (rowData) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-danger', 'btn-sm');
        button.innerHTML = '<i class="fa-solid fa-trash" title="Delete this row"></i>';
        button.addEventListener('click', () => handleDelete(rowData.id));
        return button;
    };

    const handleEdit = (rowData) => {
        const row = event.target.closest('tr');
        const cells = row.querySelectorAll('td');
        const originalData = { ...rowData };
        
        // Skip the first cell (serial number) when editing
        for (let i = 1; i < cells.length - 1; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('form-control', 'form-control-sm', 'border', 'border-secondary');
            input.value = cells[i].textContent;
            cells[i].textContent = '';
            cells[i].appendChild(input);
        }
        
        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk" ></i>';
        saveButton.title = 'Save';
        saveButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-1');
        saveButton.addEventListener('click', () => handleSave(row, originalData));

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fa-solid fa-xmark" title="Cancel"></i>';
        cancelButton.title = 'cancel';
        cancelButton.classList.add('btn', 'btn-danger', 'btn-sm');
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
        
        // Start from index 1 to skip serial number
        for (let i = 1; i < cells.length - 1; i++) {
            const key = Object.keys(originalData)[i - 1]; // Adjust index for originalData
            const input = cells[i].querySelector('input');
            if (input) {
                updatedData[key] = input.value.trim();
            }
        }
        
        const response = await fetchData('updateData.php', updatedData);
        if (response?.status === 'success') {
            fetchDataAndRender();
        } else {
            alert(response?.message || '❌ Update failed.');
        }
    };

    const handleCancel = (row, originalData) => {
        const cells = row.querySelectorAll('td');
        // Skip first cell (serial number) when restoring values
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
            const response = await fetchData('deleteData.php', { id, section: 'submitted' });
            if (response?.status === 'success') {
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Deletion failed.');
            }
        }
    };

    const fetchDataAndRender = async () => {
        const data = await fetchData('getSubmittedData.php', loggedInUser);
        if (data) renderTable(data);
    };

    elements.clearPageButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove all reports?')) {
            const response = await fetchData('clearPage.php', {});
            if (response?.status === 'success') {
                alert('All reports have been removed.');
                fetchDataAndRender();
            } else {
                alert(response?.message || 'Failed to clear reports.');
            }
        }
    });

    // Initialize the page
    fetchDataAndRender();
});