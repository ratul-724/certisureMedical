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
        fetchAllDataForDownload('pdf');
        hideDownloadOptions();
    });
    // Download as Excel
    downloadExcelButton.addEventListener('click', () => {
        fetchAllDataForDownload('excel');
        hideDownloadOptions();
    });

    const fetchAllDataForDownload = (format) => {
        fetch('http://localhost/certisureMedical/backend/getAllDataForDownload.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loggedInUser)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            try {
                const data = JSON.parse(text); // Parse the response data
                if (format === 'pdf') {
                    generatePDF(data);  // Generate PDF if format is pdf
                } else if (format === 'excel') {
                    generateExcel(data);  // Generate Excel if format is excel
                }
            } catch (error) {
                console.error('Error parsing response:', error);
                console.log('Response Text:', text);
                // Handle non-JSON response
                if (text.includes('Database connection failed') || 
                    text.includes('Query failed')) {
                    alert(text);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data for download:', error);
            alert('Failed to fetch data. Please check your internet connection.');
        });
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
    
            doc.text('All Reports', 14, 10);
    
            const tableData = data.map(item => [
                item.medical_name, item.date, item.id, item.name, item.passport, item.agent, item.laboratory, item.remarks
            ]);
    
            if (typeof doc.autoTable === "undefined") {
                console.error("Error: autoTable is not defined. Ensure the autoTable plugin is loaded.");
                return;
            }
    
            // 📌 Reduce side margins (left & right)
            doc.autoTable({
                startY: 15, 
                head: [['Medical Name', 'Date', 'ID', 'Name', 'Passport', 'Agent', 'Status', 'Remarks']],
                body: tableData,
                styles: { 
                    fontSize: 10,    // Smaller font size
                    cellPadding: 1, // Reduce cell padding
                    lineWidth: 0.1, // 🔥 Border thickness
                    lineColor: [0, 0, 0], // 🔥 Black border
                },
                headStyles: { fillColor: [100, 100, 255], textColor: 255 }, 
                margin: { left: 5, right: 5 },  // 🔥 Reduce left & right gaps
                tableWidth: 'auto' // Fit table within page width
            });
    
            doc.save('reports.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };
    
    // Generate Excel
    const generateExcel = (data) => {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Reports');
            XLSX.writeFile(wb, 'reports.xlsx');
        } catch (error) {
            console.error('Error generating Excel:', error);
        }
    };
});   