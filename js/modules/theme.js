/* ================== Theme ==================
   The class lives on <html> and is set by the inline script in <head>
   before first paint so light-mode visitors never see a dark flash.
   Theme switching uses a circular View Transition ripple from the button. */

(() => {
    const P = window.Portfolio;
    const { root, toggleThemeBtn, themeIcon } = P.dom;
    const SUN_PATH = `
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M12 4v1M12 19v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M19 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
    `;
    const MOON_PATH = '<path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />';

    function syncThemedImages(theme) {
        document.querySelectorAll('img[data-theme-light-src]').forEach(img => {
            const lightSrc = img.dataset.themeLightSrc;
            if (!lightSrc) return;
            if (img.dataset.themeDarkSrc === undefined) {
                img.dataset.themeDarkSrc = img.getAttribute('src');
            }
            img.setAttribute('src', theme === 'light' ? lightSrc : img.dataset.themeDarkSrc);
        });
    }

    function announceTheme(message) {
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

    function applyTheme(theme, { notify = true } = {}) {
        const isLight = theme === 'light';
        root.classList.toggle('light', isLight);

        if (themeIcon) {
            themeIcon.innerHTML = isLight ? SUN_PATH : MOON_PATH;
        }

        syncThemedImages(theme);
        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', isLight ? '#edf2fa' : '#060b16');

        if (notify) P.emitThemeChange(theme);
    }

    function switchThemeWithRipple(newTheme) {
        const commit = () => {
            applyTheme(newTheme);
            try { localStorage.setItem('theme', newTheme); } catch { /* ignore */ }
            announceTheme(newTheme === 'light' ? 'Light mode on' : 'Dark mode on');
            P.modules.closeMobileMenu?.();
        };

        if (!document.startViewTransition || P.isReducedMotion() || !toggleThemeBtn) {
            commit();
            return;
        }

        const rect = toggleThemeBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(commit);
        transition.ready.then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 540,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        }).catch(() => { /* ignore aborted view transitions */ });
    }

    P.modules.initTheme = function initTheme() {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let savedTheme = null;
        try {
            savedTheme = localStorage.getItem('theme');
        } catch { /* private mode */ }

        if (!savedTheme) {
            savedTheme = systemPrefersDark ? 'dark' : 'light';
            try { localStorage.setItem('theme', savedTheme); } catch { /* ignore */ }
        }

        applyTheme(P.isLightTheme() ? 'light' : 'dark', { notify: false });

        toggleThemeBtn?.addEventListener('click', () => {
            const newTheme = P.isLightTheme() ? 'dark' : 'light';
            switchThemeWithRipple(newTheme);
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            try {
                if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
            } catch {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    };
})();
