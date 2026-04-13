/* fitaura-global.js - Theme toggle + PWA install + Toast system */

// ═══ THEME TOGGLE ═══
(function() {
    const saved = localStorage.getItem('fitaura_theme') || 'dark';
    if (saved === 'light') document.body.classList.add('light-mode');
})();

window.toggleTheme = function() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('fitaura_theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = isLight ? '🌙 Dark' : '☀️ Light';
};

// ═══ TOAST ═══
window.showToast = function(msg, color = 'var(--accent-green)') {
    let c = document.querySelector('.toast-container');
    if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span style="color:${color};margin-right:0.5rem;">●</span>${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
};

// ═══ PWA INSTALL PROMPT ═══
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwaBanner');
    if (banner) banner.style.display = 'flex';
});

window.installPWA = function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        const banner = document.getElementById('pwaBanner');
        if (banner) banner.style.display = 'none';
    });
};

// ═══ INJECT THEME BUTTON + PWA BANNER into every page ═══
document.addEventListener('DOMContentLoaded', () => {
    // Theme button
    const isLight = document.body.classList.contains('light-mode');
    const btn = document.createElement('button');
    btn.className = 'theme-toggle'; btn.id = 'themeToggleBtn';
    btn.innerHTML = isLight ? '🌙 Dark' : '☀️ Light';
    btn.onclick = window.toggleTheme;
    document.body.appendChild(btn);

    // PWA install banner
    const banner = document.createElement('div');
    banner.id = 'pwaBanner'; banner.className = 'pwa-banner';
    banner.style.display = 'none';
    banner.innerHTML = `
        <span style="font-size:1.5rem;">📲</span>
        <div>
            <strong style="display:block;">Install Fitaura</strong>
            <span style="font-size:0.8rem;color:var(--text-secondary);">Add to your home screen for the best experience</span>
        </div>
        <button class="btn btn-accent" style="padding:0.5rem 1rem;font-size:0.8rem;" onclick="installPWA()">Install</button>
        <button class="btn btn-glass" style="padding:0.5rem;font-size:0.8rem;" onclick="document.getElementById('pwaBanner').style.display='none'">✕</button>
    `;
    document.body.appendChild(banner);

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../sw.js').catch(() => {});
    }
});
