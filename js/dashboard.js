// js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Validate Session & Fetch User Details
    const checkSession = async () => {
        if (!window.supabaseClient) return;

        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            // Not logged in, redirect to login page
            window.location.href = 'login.html';
            return;
        }

        // Fetch profile
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single();

        const nameDisplay = document.querySelector('.user-name-display');
        const welcomeText = document.getElementById('welcomeText');
        
        const userName = profile?.name || session.user.user_metadata?.full_name || 'User';
        
        if (nameDisplay) nameDisplay.textContent = userName;
        if (welcomeText) welcomeText.textContent = `Welcome back, ${userName}!`;
    };

    await checkSession();

    // 2. Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');

    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // 3. Dropdowns Logic
    const setupDropdown = (triggerId, panelId) => {
        const trigger = document.getElementById(triggerId);
        const panel = document.getElementById(panelId);
        
        if (!trigger || !panel) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns first
            document.querySelectorAll('.dropdown-panel').forEach(p => {
                if (p !== panel) p.classList.remove('show');
            });
            panel.classList.toggle('show');
        });

        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    };

    setupDropdown('notifToggle', 'notifPanel');
    setupDropdown('profileToggle', 'profilePanel');

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-panel').forEach(p => {
            p.classList.remove('show');
        });
    });

    // 4. Dark/Light Mode Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        }
    }

    const toggleThemeFunction = (e) => {
        if (e) e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        
        if (themeIcon) {
            if (targetTheme === 'dark') {
                themeIcon.classList.remove('ph-moon');
                themeIcon.classList.add('ph-sun');
            } else {
                themeIcon.classList.remove('ph-sun');
                themeIcon.classList.add('ph-moon');
            }
        }
        
        // Re-render chart to adjust to theme colors if needed
        renderChart(targetTheme === 'dark');
    };

    if (themeToggle) themeToggle.addEventListener('click', toggleThemeFunction);
    
    // Wire up the new theme settings buttons
    document.getElementById('sidebarThemeToggle')?.addEventListener('click', toggleThemeFunction);
    document.getElementById('dropdownThemeToggle')?.addEventListener('click', toggleThemeFunction);

    // 5. Logout Handling
    const handleLogout = async (e) => {
        e.preventDefault();
        if (window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        }
    };

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('dropdownLogoutBtn')?.addEventListener('click', handleLogout);

    // 6. Chart.js Initialization
    let activityChart = null;

    const renderChart = (isDarkTheme) => {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        const textColor = isDarkTheme ? '#cbd5e1' : '#4a5568';
        const gridColor = isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        if (activityChart) {
            activityChart.destroy(); // Destroy previous instance if re-rendering theme
        }

        activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'App Usage (Mins)',
                    data: [15, 25, 10, 30, 45, 20, 15],
                    backgroundColor: '#2b6cb0',
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    };

    // Initial render based on current theme
    const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    renderChart(isCurrentlyDark);
});
