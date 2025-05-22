document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('medical_name_select');
    const container = document.getElementById('custom_medical_name_container');
    const customInput = document.getElementById('medical_name_input');
    const hiddenInput = document.getElementById('medical_name');

    select.addEventListener('change', function() {
        if (this.value === 'other') {
            container.style.display = 'block';
            hiddenInput.value = ''; // Clear the hidden field
        } else {
            container.style.display = 'none';
            hiddenInput.value = this.value; // Set the selected value
        }
    });
    customInput.addEventListener('input', function() {
        hiddenInput.value = this.value; // Update hidden field with custom value
    });


    const form = document.getElementById('dataForm');
    let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];
    if (!Array.isArray(formDataArray)) {
        formDataArray = [];
    }
    if (!form) return; // Prevent errors if form is missing

    const fetchAllIds = () => {
        return fetch('http://localhost/amsMedical/backend/getAllIds.php')
            .then(response => response.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while fetching IDs.');
                return { tempIds: [], medIds: [] };
            });
    };

   form.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const jsonData = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

    // Submitting new data
    fetchAllIds().then(idsData => {
      const { tempIds, medIds } = idsData;

      const duplicate = tempIds.includes(jsonData.id) || medIds.includes(jsonData.id);
      if (duplicate) {
        alert('Duplicate ID found. Please use a unique ID.');
        return;
      }

      fetch('http://localhost/amsMedical/backend/temporary_submit_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      })
      .then(response => response.text())
      .then(text => {
        console.log('Response Text:', text);
        try {
          const data = JSON.parse(text);
          const messageBox = document.getElementById('responseMessage');
          if (messageBox) {
            messageBox.textContent = data.message;
            messageBox.style.color = data.success ? "green" : "red";
          }

          if (data.success) {
            form.reset(); // Reset the form after successful submission
            alert('Data submitted successfully!');

            formDataArray.push(jsonData);
            localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
          }
        } catch (error) {
          console.error('Error:', error);
        }
      })
      .catch(error => console.error('Error:', error));
    });
  });
    
    localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
});