let map;
let markers = [];
let staffLocations = [
    { lat: -34.397, lng: 150.644, title: 'Staff 1' },
    { lat: -35.397, lng: 151.644, title: 'Staff 2' },
    // Add more staff locations
];
document.addEventListener("DOMContentLoaded", function () {

    initMap();

    const addStaffForm = document.getElementById('addStaffForm');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', addStaff);
    }

    const editStaffForm = document.getElementById('editStaffForm');
    if (editStaffForm) {
        editStaffForm.addEventListener('submit', updateStaff);
    }
});

function initMap() {
    // The map, centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: {lat: -25.344, lng: 131.036}, // Update to a default or dynamic center
    });
    // Loop through staff locations and add a marker for each
    staffLocations.forEach(function (location) {
        addMarker({ lat: location.lat, lng: location.lng }, location.title);
    });
    addMarker({ lat: -34.397, lng: 150.644 }, 'Default Location');
}


// Initialize and add the map
function initMap() {
    // The map, centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: { lat: -25.344, lng: 131.036 }, // Update to a default or dynamic center
    });
}

// Adds a marker to the map and push to the array.
function addMarker(location, title) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        icon: 'static/img/marker.png',
    });
    // Add click listener to the marker
    marker.addListener('click', function () {
        // Action to perform on click, e.g., open an info window
        map.setZoom(8);
        map.setCenter(marker.getPosition());
        // You can also show an InfoWindow here
    });
    markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (let marker of markers) {
        marker.setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

// Fetch staff locations and update map markers
function fetchStaffLocations(cityName = '') {
    fetch('/get_staff_by_city?city=' + cityName)
        .then(response => response.json())
        .then(data => {
            deleteMarkers(); // Clear existing markers
            data.forEach(staff => {
                const location = { lat: staff.latitude, lng: staff.longitude };
                addMarker(location, staff.name); // Add a marker for each staff
            });
        })
        .catch(error => console.error('Error:', error));
}


function addStaff(event) {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target); // Assuming 'event.target' is your form
    fetch('/add_staff', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            alert('Staff added successfully!');
            fetchStaffLocations(); // Refresh map markers
        })
        .catch(error => console.error('Error:', error));
}

// Example event listener for form submission
document.getElementById('addStaffForm').addEventListener('submit', addStaff);


function updateMap(staffData) {
    // Clear existing markers
    deleteMarkers(); // Use the deleteMarkers function to clear markers

    // Optionally set the map view to the first staff location
    if (staffData.length > 0) {
        const firstStaff = staffData[0];
        const newPosition = new google.maps.LatLng(firstStaff.latitude, firstStaff.longitude);
        map.setCenter(newPosition);
        map.setZoom(13);
    }

    // Add markers for staff locations
    staffData.forEach(staff => {
        addMarker({ lat: staff.latitude, lng: staff.longitude }, staff.name);
    });
}


function updateStaff(event) {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target); // Assuming 'event.target' is your update form
    fetch('/update_staff', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            alert('Staff updated successfully!');
            fetchStaffLocations(); // Refresh map markers
        })
        .catch(error => console.error('Error:', error));
}

// Attach this event listener to your update form submission
document.getElementById('editStaffForm').addEventListener('submit', updateStaff);


function deleteStaff(staffId) {
    // Show confirmation modal before deleting
    $('#deleteStaffModal').modal('show');

    // Event listener for delete confirmation
    $('#confirmDeleteBtn').on('click', function () {
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

    fetchStaffLocations();
}


