/**
 * Global UI Components
 */

/**
 * Global Sidebar Definition
 */
window.initializeSidebar = function(activePage) {
    const sidebar = document.querySelector('.layout-sidebar');
    if (!sidebar) return;

    const navItems = [
        { id: 'dashboard.html', label: 'Dashboard', icon: '📊' },
        { id: 'performanceTwin.html', label: 'Performance Twin', icon: '⚡' },
        { id: 'workout.html', label: 'Training System', icon: '🏋️' },
        { id: 'muscle-heatmap.html', label: 'Muscle Heatmap', icon: '💪' },
        { id: 'cardio.html', label: 'Endurance Zone', icon: '🫀' },
        { id: 'diet.html', label: 'Nutrition Engine', icon: '🍽️' },
        { id: 'analytics.html', label: 'Analytics Center', icon: '📈' },
        { id: 'ai-coach.html', label: 'AI Coach', icon: '🧠' },
        { id: 'progress-photos.html', label: 'Progress Photos', icon: '📸' },
        { id: 'leaderboard.html', label: 'Leaderboard', icon: '🏆' },
        { id: 'device-sync.html', label: 'Device Sync', icon: '🔗' },
        { id: 'profile.html', label: 'Athlete Profile', icon: '👤', style: 'margin-top:2rem;' }
    ];

    let html = `
        <a href="dashboard.html" class="brand">
            <div class="brand-dot" style="background: var(--accent-purple); box-shadow: var(--shadow-glow-purple);"></div> 
            Fitaura Elite
        </a>
        <ul class="nav-links">
    `;

    navItems.forEach(item => {
        const isActive = activePage === item.id || window.location.pathname.endsWith(item.id);
        const style = item.style ? `style="${item.style}"` : '';
        html += `
            <li ${style}>
                <a href="${item.id}" class="nav-item ${isActive ? 'active' : ''}">
                    ${item.icon} ${item.label}
                </a>
            </li>
        `;
    });

    html += `</ul>`;
    sidebar.innerHTML = html;

    // --- Inject Mobile PWA Navigation ---
    if (!document.querySelector('.mobile-bottom-bar')) {
        // Mobile bottom tabs
        const bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-bar';
        
        const isDash = activePage === 'dashboard.html' ? 'active' : '';
        const isWorkout = activePage === 'workout.html' ? 'active' : '';
        const isDiet = activePage === 'diet.html' ? 'active' : '';
        const isProfile = activePage === 'profile.html' ? 'active' : '';

        bottomNav.innerHTML = `
            <div class="mobile-bottom-bar-inner">
                <a href="dashboard.html" class="mobile-nav-item ${isDash}">
                    <span class="icon">📊</span>
                    <span>Home</span>
                </a>
                <a href="workout.html" class="mobile-nav-item ${isWorkout}">
                    <span class="icon">🏋️</span>
                    <span>Train</span>
                </a>
                <a href="diet.html" class="mobile-nav-item ${isDiet}">
                    <span class="icon">🍽️</span>
                    <span>Diet</span>
                </a>
                <a href="profile.html" class="mobile-nav-item ${isProfile}">
                    <span class="icon">👤</span>
                    <span>Profile</span>
                </a>
                <a href="#" class="mobile-nav-item" id="mobileMenuBtn">
                    <span class="icon">☰</span>
                    <span>Menu</span>
                </a>
            </div>
        `;
        document.body.appendChild(bottomNav);

        // Mobile full-screen menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        
        let menuHtml = `
            <button class="mobile-menu-close" id="mobileMenuCloseBtn">✕</button>
            <h2 style="font-family: var(--font-heading); font-size: 2rem;">Fitaura Elite</h2>
            <ul class="mobile-menu-nav">
        `;
        navItems.forEach(item => {
            menuHtml += `
                <li>
                    <a href="${item.id}">
                        <span style="font-size: 1.5rem">${item.icon}</span> ${item.label}
                    </a>
                </li>
            `;
        });
        menuHtml += `</ul>`;
        mobileMenu.innerHTML = menuHtml;
        document.body.appendChild(mobileMenu);

        // Mobile Menu Event Listeners
        document.getElementById('mobileMenuBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });
        document.getElementById('mobileMenuCloseBtn').addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
};

window.createExerciseCard = function(exercise, options = {}) {
    const isCardio = options.isCardio || false;
    
    // Format image filename from exercise name
    // e.g., "Barbell Back Squat" -> "barbell-back-squat"
    const imageName = exercise.name ? exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'default';
    const imagePath = `images/exercises/${imageName}.png`;
    
    // Subtext logic (Sets x Reps or Duration)
    let subtext = '';
    if (isCardio) {
        subtext = `${exercise.duration} Minutes`;
    } else {
        subtext = `${exercise.sets} Sets × ${exercise.reps} Reps`;
    }

    // Right-side value label (Target Load or Target HR)
    let valueLabel = isCardio ? 'Target HR:<br><strong style="color:var(--accent-blue); font-size:1rem;">' + exercise.targetHR + ' BPM</strong>' : 'Target Load:<br><strong style="color:var(--accent-purple); font-size:1rem;">' + (exercise.targetWeight || 'Base') + '</strong>';
    
    // Input placeholder
    let inputPlaceholder = isCardio ? 'bpm' : 'kg';
    
    let elementId = isCardio ? `cardio_${exercise.id}` : `ex_${exercise.id}`;

    const el = document.createElement('div');
    el.className = 'exercise-card-container flex justify-between items-center';

    let inputHtml = '';
    if (options.hideInput) {
        inputHtml = '';
    } else {
        inputHtml = `<input type="number" class="form-control focus-glow" id="${elementId}" placeholder="${inputPlaceholder}" style="width: 80px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">`;
    }

    el.innerHTML = `
        <div class="flex items-center gap-1" style="flex: 2;">
            <div class="exercise-image-wrapper">
                <img src="${imagePath}" alt="${exercise.name}" class="exercise-card-image" onerror="this.onerror=null;this.src='images/exercises/default.png';">
            </div>
            <div>
                <h4 class="exercise-title">${exercise.name}</h4>
                <span class="text-secondary exercise-subtext">${subtext}</span>
            </div>
        </div>
        <div style="flex: 1; text-align: right;" class="flex gap-1 items-center justify-end">
            <div class="text-secondary exercise-target-label" style="font-size: 0.8rem;">
                ${valueLabel}
            </div>
            ${inputHtml}
        </div>
    `;
    
    return el;
};
