// js/appointments.js

document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById('booking-form');
    const facilitySelect = document.getElementById('facility');
    const authWarning = document.getElementById('auth-warning');
    const bookingSection = document.getElementById('booking-section');
    const bookingMessage = document.getElementById('booking-message');

    init();

    async function init() {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').setAttribute('min', today);

        // Form is publicly accessible now per requirements
        if (authWarning) {
            authWarning.classList.remove('visible');
        }
        if (bookingSection) {
            bookingSection.style.display = 'block';
        }
        
        loadFacilities();
        
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBooking);
        }
    }

    async function loadFacilities() {
        const mockFacilities = [
            { id: '1', name: "Uganda Cancer Institute" },
            { id: '2', name: "Mulago National Referral Hospital" },
            { id: '3', name: "Mukono Health Centre IV" }
        ];

        facilitySelect.innerHTML = '<option value="" disabled selected>Choose a facility...</option>';
        
        mockFacilities.forEach(f => {
            const option = document.createElement('option');
            // send facility name to Supabase
            option.value = f.name;
            option.textContent = f.name;
            facilitySelect.appendChild(option);
        });

        // Preselect facility if passed via URL parameters (from map page)
        const urlParams = new URLSearchParams(window.location.search);
        const facilityIdParam = urlParams.get('facility');
        if (facilityIdParam) {
            if (facilityIdParam === '1') facilitySelect.value = mockFacilities[0].name;
            else if (facilityIdParam === '2') facilitySelect.value = mockFacilities[1].name;
            else if (facilityIdParam === '3') facilitySelect.value = mockFacilities[2].name;
        }
    }

    async function handleBooking(e) {
        e.preventDefault();

        const health_facility = document.getElementById('facility').value;
        const preferred_date = document.getElementById('date').value;
        const preferred_time = document.getElementById('time').value;
        const reason_for_visit = document.getElementById('reason').value;

        const submitBtn = bookingForm.querySelector('button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Booking...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://pszrocbwnmkwsuywiebq.supabase.co/rest/v1/form_submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzenJvY2J3bm1rd3N1eXdpZWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTEyOTEsImV4cCI6MjA4OTcyNzI5MX0.5mDA6eWqcmDQk9mqZikoIT9586vR-6ZeYrkrTW0R5lQ',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzenJvY2J3bm1rd3N1eXdpZWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTEyOTEsImV4cCI6MjA4OTcyNzI5MX0.5mDA6eWqcmDQk9mqZikoIT9586vR-6ZeYrkrTW0R5lQ'
                },
                body: JSON.stringify({
                    "Health_facility": health_facility,
                    "preferred_date": preferred_date,
                    "preferred_time": preferred_time,
                    "reason_for_visit": reason_for_visit
                })
            });

            if (response.ok) {
                showSuccess("Form submitted successfully");
                bookingForm.reset();
            } else {
                const errorData = await response.text();
                console.error("Submission error:", errorData);
                showError("Submission failed");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            showError("Submission failed");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    function showError(msg) {
        bookingMessage.textContent = msg;
        bookingMessage.className = 'alert alert-error';
        bookingMessage.style.display = 'block';
    }

    function showSuccess(msg) {
        bookingMessage.textContent = msg;
        bookingMessage.className = 'alert alert-success';
        bookingMessage.style.display = 'block';
    }
});
