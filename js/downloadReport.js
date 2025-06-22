document.addEventListener('DOMContentLoaded', () => {
    const downloadIcon = document.getElementById('downloadIcon');
    const downloadOptions = document.getElementById('downloadOptions');
    const downloadPDFButton = document.getElementById('downloadPDF');
    const downloadExcelButton = document.getElementById('downloadExcel');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Show download options when clicking on Download icon
    downloadIcon.addEventListener('click', () => {
        // Toggle dropdown visibility
        downloadOptions.style.display = downloadOptions.style.display === 'block' ? 'none' : 'block';
    });

    // Hide download options after choosing a format
    const hideDownloadOptions = () => {
        downloadOptions.style.display = 'none';
    };

    // Download as PDF
    downloadPDFButton.addEventListener('click', () => {
        const currentData = getCurrentPageData();
        if (currentData.length > 0) {
            generatePDF(currentData);
        } else {
            alert('No data to download');
        }
        hideDownloadOptions();
    });

    // Download as Excel
    downloadExcelButton.addEventListener('click', () => {
        const currentData = getCurrentPageData();
        if (currentData.length > 0) {
            generateExcel(currentData);
        } else {
            alert('No data to download');
        }
        hideDownloadOptions();
    });

    // Function to get current page data from the table
    const getCurrentPageData = () => {
        const table = document.querySelector('#dataDisplay table');
        if (!table) return [];

        const headers = Array.from(table.querySelectorAll('thead th')).map(th => {
            const text = th.textContent.toLowerCase().trim();
            // Map table headers to data keys
            return {
                'sl': 'sl',
                'medical name': 'medical_name',
                'date': 'date',
                'id': 'id',
                'name': 'name',
                'passport': 'passport',
                'agent': 'agent',
                'status': 'laboratory',
                'remarks': 'remarks',
                'actions': 'actions'
            }[text] || text; // default to original text if not found
        });

        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = {};
            
            cells.forEach((cell, index) => {
                if (index < headers.length) { // Ensure we don't go beyond headers
                    const key = headers[index];
                    if (key !== 'actions') { // Skip actions column if exists
                        rowData[key] = cell.textContent.trim();
                    }
                }
            });
            
            data.push(rowData);
        });

        return data;
    };

    // Generate PDF
    const generatePDF = (data) => {
        try {
            if (typeof window.jspdf === "undefined") {
                console.error("Error: jsPDF is not loaded. Make sure the script is included.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            doc.text('Reports', 14, 10);

            const tableData = data.map(item => [
                item.sl || '',
                item.medical_name || '',
                item.date || '',
                item.id || '',
                item.name || '',
                item.passport || '',
                item.agent || '',
                item.laboratory || '',
                item.remarks || ''
            ]);

            if (typeof doc.autoTable === "undefined") {
                console.error("Error: autoTable is not defined. Ensure the autoTable plugin is loaded.");
                return;
            }

            doc.autoTable({
                startY: 15, 
                head: [['SL', 'Medical Name', 'Date', 'ID', 'Name', 'Passport', 'Agent', 'Status', 'Remarks']],
                body: tableData,
                styles: { 
                    fontSize: 10,
                    cellPadding: 1,
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                },
                headStyles: { fillColor: [100, 100, 255], textColor: 255 }, 
                margin: { left: 5, right: 5 },
                tableWidth: 'auto'
            });

            doc.save('reports.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    
    // Generate Excel
    const generateExcel = (data) => {
        try {
            // Transform data to match expected format
            const excelData = data.map(item => ({
                'SL': item.sl,
                'Medical Name': item.medical_name,
                'Date': item.date,
                'ID': item.id,
                'Name': item.name,
                'Passport': item.passport,
                'Agent': item.agent,
                'Status': item.laboratory,
                'Remarks': item.remarks
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Reports');
            XLSX.writeFile(wb, 'reports.xlsx');
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel. Please try again.');
        }
    };
});