// js/symptoms.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('symptom-form');
    const resultContainer = document.getElementById('result-container');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');

    if (form) {
        form.addEventListener('submit', handleSymptomSubmit);
    }

    async function handleSymptomSubmit(e) {
        e.preventDefault();

        // Gather responses
        const formData = new FormData(form);
        const responses = {
            q1_difficulty_urinating: formData.get('q1'),
            q2_frequent_urination: formData.get('q2'),
            q3_blood_in_urine: formData.get('q3'),
            q4_weak_flow: formData.get('q4'),
            q5_pelvic_discomfort: formData.get('q5')
        };

        // Calculate risk points
        // Weighting system:
        // Blood in urine (q3) = 3 pts
        // Difficulty urinating (q1), Weak flow (q4) = 2 pts
        // Frequent urination (q2), Pelvic discomfort (q5) = 1 pt
        let score = 0;
        if (responses.q1_difficulty_urinating === 'yes') score += 2;
        if (responses.q2_frequent_urination === 'yes') score += 1;
        if (responses.q3_blood_in_urine === 'yes') score += 3;
        if (responses.q4_weak_flow === 'yes') score += 2;
        if (responses.q5_pelvic_discomfort === 'yes') score += 1;

        let riskLevel = 'Low';
        let title = '';
        let desc = '';
        let cssClass = '';

        if (score >= 4) {
            riskLevel = 'High';
            title = 'High Risk Detected';
            desc = 'Based on your answers, you are exhibiting significant symptoms associated with prostate issues. **We strongly recommend visiting a medical facility immediately for a professional evaluation.**';
            cssClass = 'result-high';
        } else if (score >= 2) {
            riskLevel = 'Moderate';
            title = 'Moderate Risk Detected';
            desc = 'You have reported some symptoms that warrant medical attention. It is advisable to schedule an appointment with a healthcare provider for a thorough check-up.';
            cssClass = 'result-moderate';
        } else {
            riskLevel = 'Low';
            title = 'Low Risk';
            desc = 'Your reported symptoms indicate a low risk at this time. However, regular screenings are still important for prostate health, especially if you are over 50. Consult a doctor for routine check-ups.';
            cssClass = 'result-low';
        }

        // Display results
        resultContainer.className = `result-card ${cssClass}`;
        resultTitle.textContent = title;
        resultDesc.innerHTML = desc; // simple styling, relying on textContent equivalent or innerHTML if we format
        
        // Hide form and show result
        form.style.display = 'none';
        resultContainer.style.display = 'block';

        // Try to save to Supabase if logged in
        saveToDatabase(responses, riskLevel);
    }

    async function saveToDatabase(responses, riskLevel) {
        if (!window.supabaseClient) return;

        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        
        if (sessionData && sessionData.session) {
            const userId = sessionData.session.user.id;

            const { error } = await window.supabaseClient
                .from('symptoms_checks')
                .insert([
                    {
                        user_id: userId,
                        responses: responses,
                        risk_level: riskLevel
                    }
                ]);

            if (error) {
                console.error("Error saving symptom check:", error.message);
            } else {
                console.log("Symptom check saved successfully.");
            }
        } else {
            console.log("User not logged in, symptom check not saved.");
        }
    }
});
