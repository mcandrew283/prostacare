// js/supabase.js
/**
 * Supabase client configuration for ProstaCare app.
 * IMPORTANT: Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with actual keys.
 */
const SUPABASE_URL = 'https://pszrocbwnmkwsuywiebq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzenJvY2J3bm1rd3N1eXdpZWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTEyOTEsImV4cCI6MjA4OTcyNzI5MX0.5mDA6eWqcmDQk9mqZikoIT9586vR-6ZeYrkrTW0R5lQ';

let supabaseClient = null;

if (window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client successfully initialized.");
    } catch (error) {
        console.error("Failed to initialize Supabase:", error);
    }
} else {
    console.warn("Supabase script not found. Make sure it's loaded before this file.");
}

// Attach to window to make it accessible globally
window.supabaseClient = supabaseClient;
