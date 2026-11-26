/* ============================================================
   elements.js — shared DOM cache, motion & theme event bus
   ============================================================ */

window.Portfolio = (() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionListeners = new Set();
    const themeListeners = new Set();
    const revealListeners = new Set();

    const state = {
        prefersReducedMotion: motionQuery.matches,
        pageRevealed: false
    };

    const dom = {
        root: document.documentElement,
        toggleThemeBtn: document.getElementById('toggleTheme'),
        themeIcon: document.getElementById('icon'),
        menuToggleBtn: document.getElementById('menuToggle'),
        navMenu: document.getElementById('navMenu'),
        navOverlay: document.getElementById('nav-overlay'),
        typewriter: document.getElementById('typewriter'),
        backToTop: document.getElementById('backToTop'),
        contactForm: document.getElementById('contactForm'),
        tiltCards: document.querySelectorAll('[data-tilt]')
    };

    motionQuery.addEventListener('change', e => {
        state.prefersReducedMotion = e.matches;
        motionListeners.forEach(fn => fn(state.prefersReducedMotion));
    });

    return {
        dom,
        isReducedMotion: () => state.prefersReducedMotion,
        isLightTheme: () => dom.root.classList.contains('light'),
        onMotionChange: fn => motionListeners.add(fn),
        onThemeChange: fn => themeListeners.add(fn),
        emitThemeChange: theme => themeListeners.forEach(fn => fn(theme)),
        onPageRevealed: fn => {
            if (state.pageRevealed) fn();
            else revealListeners.add(fn);
        },
        markPageRevealed: () => {
            if (state.pageRevealed) return;
            state.pageRevealed = true;
            window.__pageRevealed = true;
            revealListeners.forEach(fn => fn());
            revealListeners.clear();
        },
        modules: {}
    };
})();
