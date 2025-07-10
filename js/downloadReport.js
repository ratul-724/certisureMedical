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
            const text = th.textContent.trim();
            // Map table headers to data keys - KEEPING YOUR ORIGINAL MAPPING
            return {
                'SL': 'sl',
                'MEDICAL NAME': 'medical_name',
                'DATE': 'date',
                'ID': 'id',
                'NAME': 'name',
                'PASSPORT': 'passport',
                'AGENT': 'agent',
                'STATUS': 'laboratory',
                'REMARKS': 'remarks',
                'ACTIONS': 'actions'
            }[text.toUpperCase()] || text.toLowerCase();
        });

        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = {};
            
            cells.forEach((cell, index) => {
                if (index < headers.length) {
                    const key = headers[index];
                    if (key !== 'actions') {
                        rowData[key] = cell.textContent.trim();
                    }
                }
            });
            
            data.push(rowData);
        });

        return data;
    };

    // Generate PDF - WITH ORIGINAL STYLING
    const generatePDF = (data) => {
        try {
            if (typeof window.jspdf === "undefined") {
                console.error("Error: jsPDF is not loaded.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            // Title with your original styling
            doc.setFontSize(16);
            doc.setTextColor(40);
            doc.text('CertiSure Medical Agency - Reports', 14, 10);

            // Prepare table data
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
                console.error("Error: autoTable plugin not loaded.");
                return;
            }

            // Table styling matching your original
            doc.autoTable({
                startY: 20,
                head: [['SL', 'Medical Name', 'Date', 'ID', 'Name', 'Passport', 'Agent', 'Status', 'Remarks']],
                body: tableData,
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    textColor: [0, 0, 0]
                },
                headStyles: {
                    fillColor: [51, 122, 183], // Your original blue color
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { left: 5, right: 5 }
            });

            doc.save('CertiSure-Reports.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    
    // Generate Excel - WITH ORIGINAL STYLING
    const generateExcel = (data) => {
        try {
            // Transform data to match your original format
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
            
            // Add some basic styling
            if (ws['!cols'] === undefined) ws['!cols'] = [];
            ws['!cols'][1] = { width: 20 }; // Wider column for Medical Name
            ws['!cols'][4] = { width: 20 }; // Wider column for Name
            
            XLSX.utils.book_append_sheet(wb, ws, 'Reports');
            XLSX.writeFile(wb, 'CertiSure-Reports.xlsx');
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel. Please try again.');
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!downloadIcon.contains(event.target)) {
            downloadOptions.style.display = 'none';
        }
    });
});