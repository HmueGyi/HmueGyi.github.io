/* ================== Theme ==================
   The class lives on <html> and is set by the tiny inline script in
   <head> before first paint, so a light-mode visitor never sees a dark
   flash. This module only handles the toggle and the toggle icon. */

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let savedTheme = localStorage.getItem('theme');

if (!savedTheme) {
    savedTheme = systemPrefersDark ? 'dark' : 'light';
    try { localStorage.setItem('theme', savedTheme); } catch (e) { /* private mode */ }
}

const themeRoot = document.documentElement;

function applyTheme(theme) {
    if (theme === 'light') {
        themeRoot.classList.add('light');
        if (icon) icon.innerHTML = `
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            d="M12 4v1M12 19v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M19 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
        `;
    } else {
        themeRoot.classList.remove('light');
        if (icon) icon.innerHTML = `
            <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />
        `;
    }
    syncThemedImages(theme);
    // Keep the mobile browser chrome in sync with the page
    document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'light' ? '#f4f6fc' : '#091322');
}

/* Swap images that ship a separate light/dark artwork */
function syncThemedImages(theme) {
    document.querySelectorAll('img[data-theme-light-src]').forEach(img => {
        const lightSrc = img.dataset.themeLightSrc;
        if (!lightSrc || img.dataset.themeDarkSrc === undefined) {
            img.dataset.themeDarkSrc = img.getAttribute('src');
        }
        img.setAttribute('src', theme === 'light' ? lightSrc : img.dataset.themeDarkSrc);
    });
}

function initTheme() {
    // Mirror the pre-paint decision (html.light) onto body + the toggle icon
    applyTheme(themeRoot.classList.contains('light') ? 'light' : 'dark');

    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', () => {
            const newTheme = themeRoot.classList.contains('light') ? 'dark' : 'light';
            applyTheme(newTheme);
            try { localStorage.setItem('theme', newTheme); } catch (e) { /* ignore */ }
            liveRegion(newTheme === 'light' ? 'Light mode on' : 'Dark mode on');
            closeMobileMenu();
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
}

/* Announce theme changes for screen-reader users */
function liveRegion(message) {
    let el = document.getElementById('sr-live');
    if (!el) {
        el = document.createElement('p');
        el.id = 'sr-live';
        el.className = 'sr-only';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
    }
    el.textContent = message;
}
