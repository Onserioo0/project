// Initialize Leaflet map
var map = L.map('mapid').setView([51.505, -0.09], 13);

// Add tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

// Add marker to the map on click
map.on('click', function(e) {
    var latlng = e.latlng;
    document.getElementById('latitude').value = latlng.lat;
    document.getElementById('longitude').value = latlng.lng;
    L.marker(latlng).addTo(map);
});

// Function to handle search based on city
document.getElementById('searchCityBtn').addEventListener('click', function() {
    var cityName = document.getElementById('searchCity').value.trim();
    if (!cityName) {
        alert('Please enter a city name.');
        return;
    }
    fetchStaffByCity(cityName);
});

// Function to fetch staff based on city
function fetchStaffByCity(cityName) {
    // Make an AJAX request to fetch staff based on city
    fetch('/get_staff_by_city?city=' + cityName)
        .then(response => response.json())
        .then(data => {
            // Update the table with the fetched staff data
            updateStaffTable(data.staff);
            // Update the map with the fetched staff data
            updateMap(data.staff);
        })
        .catch(error => console.error('Error:', error));
}

function updateMap(staffData) {
    // Clear existing markers
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Set the map view to the first staff location
    if (staffData.length > 0) {
        const firstStaff = staffData[0];
        map.setView([firstStaff.latitude, firstStaff.longitude], 13);
    }

    // Add markers for staff locations
    staffData.forEach(staff => {
        const marker = L.marker([staff.latitude, staff.longitude]).addTo(map);
        marker.bindPopup(`
            <b>${staff.name}</b><br>
            ${staff.address}<br>
            ${staff.city}, ${staff.postal_code}
        `);
    });
}

// Function to handle staff deletion
function deleteStaff(staffId) {
    // Show confirmation modal before deleting
    $('#deleteStaffModal').modal('show');

    // Event listener for delete confirmation
    $('#confirmDeleteBtn').on('click', function() {
        // Make an AJAX request to delete staff
        fetch('/delete_staff/' + staffId, {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    alert('Staff deleted successfully!');
                    // Refresh the staff table or update it with the new data
                    location.reload(); // Reload the page to reflect the changes
                } else {
                    alert('Failed to delete staff.');
                }
                $('#deleteStaffModal').modal('hide');
            })
            .catch(error => console.error('Error:', error));
    });
}

// Event listener for delete button clicks
$('.delete-btn').on('click', function() {
    var staffId = $(this).data('staff-id');
    deleteStaff(staffId);
});

document.addEventListener("DOMContentLoaded", function() {
    // Function to handle search based on city
    document.getElementById('searchCityBtn').addEventListener('click', function() {
        var cityName = document.getElementById('searchCity').value.trim();
        if (!cityName) {
            alert('Please enter a city name.');
            return;
        }
        // Make an AJAX request to fetch staff based on city
        fetchStaffByCity(cityName);
    });
});

// Add event listener for the edit button click
$('tbody').on('click', '.edit-btn', function() {
    var employeeId = $(this).data('staff-id');
    fetchStaffById(employeeId);
});

// Function to fetch staff data by employee ID
function fetchStaffById(employeeId) {
    fetch(`/update_staff/${employeeId}`)
        .then(response => response.json())
        .then(data => {
            populateEditForm(data);
        })
        .catch(error => console.error('Error:', error));
}

// Function to populate the edit form with staff data
function populateEditForm(staffData) {
    // Populate the modal form fields with staff data
    $('#edit_staff_id').val(staffData.id);
    $('#edit_full_name').val(staffData.name);
    $('#edit_birthdate').val(staffData.birthdate);
    $('#edit_sin').val(staffData.sin);
    $('#edit_phone_number').val(staffData.phone_number);
    $('#edit_address').val(staffData.address);
    $('#edit_city').val(staffData.city);
    $('#edit_postal_code').val(staffData.postal_code);
    $('#edit_latitude').val(staffData.latitude);
    $('#edit_longitude').val(staffData.longitude);

    // Set the map location
    setMapLocation(staffData.latitude, staffData.longitude);

    // Show the edit modal
    $('#editStaffModal').modal('show');
}

// Function to set the map location
function setMapLocation(latitude, longitude) {
    map.setView([latitude, longitude], 13);
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    L.marker([latitude, longitude]).addTo(map);
}