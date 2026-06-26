// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authBtn = document.getElementById('auth-btn'); // Link in header

    // Check current session
    checkSession();

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    async function checkSession() {
        if (!window.supabaseClient) return;

        const { data, error } = await window.supabaseClient.auth.getSession();
        
        if (data && data.session) {
            // User is logged in
            if (authBtn) {
                authBtn.textContent = 'Logout';
                authBtn.href = '#'; 
                authBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const { error } = await window.supabaseClient.auth.signOut();
                    if (!error) {
                        window.location.reload();
                    }
                });
            }
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('auth-error');
        
        errorDiv.style.display = 'none';

        if (!window.supabaseClient) {
            showError(errorDiv, "Supabase client not initialized. Please add your credentials in js/supabase.js.");
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (error) {
            showError(errorDiv, error.message);
        } else {
            // Success, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('auth-message');
        
        messageDiv.style.display = 'none';
        messageDiv.className = 'alert';

        if (!window.supabaseClient) {
            showError(messageDiv, "Supabase client not initialized. Please add your credentials in js/supabase.js.");
            return;
        }

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        // 1. Sign up user in Auth
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (error) {
            showError(messageDiv, error.message);
        } else {
            // 2. Insert into public.profiles (Using raw insert for now)
            if (data.user) {
                const { error: profileError } = await window.supabaseClient
                    .from('profiles')
                    .insert([
                        { id: data.user.id, name: name, email: email }
                    ]);
                
                if (profileError) {
                    showError(messageDiv, profileError.message);
                    return;
                }
            }

            showMessage(messageDiv, "Account created successfully", 'alert-success');
            signupForm.reset();
            
            // Optional: redirect to login after a couple of seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.add('alert-error');
        element.classList.remove('alert-success');
        element.style.display = 'block';
    }

    function showMessage(element, message, className) {
        element.textContent = message;
        element.classList.remove('alert-error');
        element.classList.add(className);
        element.style.display = 'block';
    }
});
