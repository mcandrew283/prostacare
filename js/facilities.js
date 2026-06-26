// js/facilities.js

document.addEventListener("DOMContentLoaded", () => {
    // Basic coordinate variables
    let map;
    let markers = [];
    let currentPos = [0.347596, 32.582520]; // Default to Kampala, Uganda

    const mapContainer = document.getElementById('map');
    const facilitiesListContainer = document.getElementById('facilities-list');
    const searchBtn = document.getElementById('search-btn');
    const geoBtn = document.getElementById('geolocation-btn');
    const searchInput = document.getElementById('location-search');

    if (mapContainer) {
        initMap();
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    if (geoBtn) {
        geoBtn.addEventListener('click', handleGeolocation);
    }

    function initMap() {
        // Initialize Leaflet Map
        map = L.map('map').setView(currentPos, 13);

        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Load mock/initial facilities
        // In a real app, this would fetch from Supabase `health_facilities` table based on bounding box
        loadMockFacilities();
    }

    function handleGeolocation() {
        if ("geolocation" in navigator) {
            geoBtn.textContent = '⏳';
            navigator.geolocation.getCurrentPosition((position) => {
                currentPos = [position.coords.latitude, position.coords.longitude];
                updateMapLocation(currentPos, 12);
                geoBtn.textContent = '📍';
            }, (error) => {
                console.error("Error getting location:", error);
                alert("Could not retrieve your location. Check your browser permissions.");
                geoBtn.textContent = '📍';
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        searchBtn.textContent = "...";
        
        try {
            // Use Nominatim API (OpenStreetMap's geocoding service) to convert city name to coords
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                currentPos = [lat, lon];
                updateMapLocation(currentPos, 12);
            } else {
                alert("Location not found.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Error searching for location.");
        }

        searchBtn.textContent = "Search";
    }

    function updateMapLocation(coords, zoom) {
        map.setView(coords, zoom);
        
        // Add a marker for user's location
        L.marker(coords).addTo(map)
            .bindPopup('<b>Your Location</b>').openPopup();

        // In a real application, we would query Supabase here:
        // const { data } = await supabaseClient.from('health_facilities').select('*');
        // Filter by distance to `coords`.
        
        loadMockFacilities(coords);
    }

    function loadMockFacilities(centerCoords = currentPos) {
        // Clear old markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        facilitiesListContainer.innerHTML = '';

        // Generate semi-random mock facilities near the current location
        const mockData = [
            { id: 1, name: "Uganda Cancer Institute", type: "Cancer Center", latOffset: 0.005, lngOffset: 0.002, phone: "+256 414 540410", distance: "2 km" },
            { id: 2, name: "Mulago National Referral Hospital", type: "National Hospital", latOffset: -0.002, lngOffset: -0.005, phone: "+256 414 554001", distance: "2.5 km" },
            { id: 3, name: "Mukono Health Centre IV", type: "Clinic", latOffset: 0.012, lngOffset: 0.166, phone: "+256 414 290141", distance: "21 km" }
        ];

        mockData.forEach(facility => {
            const fLat = centerCoords[0] + facility.latOffset;
            const fLng = centerCoords[1] + facility.lngOffset;

            // Add marker
            const marker = L.marker([fLat, fLng]).addTo(map);
            const popupContent = `
                <b>${facility.name}</b><br>
                ${facility.type}<br>
                ${facility.phone}<br>
                <a href="appointments.html?facility=${facility.id}" style="color: #2b6cb0; text-decoration: underline; display: inline-block; margin-top: 5px;">Book Appointment</a>
            `;
            marker.bindPopup(popupContent);
            markers.push(marker);

            // Add Sidebar Card
            const card = document.createElement('div');
            card.className = 'facility-card';
            card.innerHTML = `
                <h4>${facility.name}</h4>
                <p>${facility.type}</p>
                <div class="facility-meta">
                    <span>${facility.distance}</span>
                    <a href="appointments.html?facility=${facility.id}" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Book</a>
                </div>
            `;
            
            // Pan map to marker when card is clicked
            card.addEventListener('click', () => {
                map.setView([fLat, fLng], 15);
                marker.openPopup();
            });

            facilitiesListContainer.appendChild(card);
        });
    }
});
