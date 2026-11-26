/* ================== Mobile navigation menu ==================
   Overlay drawer with a focus trap: while open, Tab stays inside
   the menu, and focus returns to the toggle button when it closes. */

(() => {
    const P = window.Portfolio;
    const { menuToggleBtn, navMenu, navOverlay } = P.dom;

    function closeMobileMenu(returnFocus = false) {
        const wasOpen = navMenu?.classList.contains('open');
        navMenu?.classList.remove('open');

        if (menuToggleBtn) {
            menuToggleBtn.innerHTML = '&#9776;';
            menuToggleBtn.setAttribute('aria-expanded', 'false');
        }

        if (navOverlay) {
            navOverlay.classList.remove('active');
            navOverlay.setAttribute('aria-hidden', 'true');
        }

        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        if (wasOpen && returnFocus) menuToggleBtn?.focus();
    }

    P.modules.closeMobileMenu = closeMobileMenu;

    P.modules.initMenu = function initMenu() {
        if (!menuToggleBtn || !navMenu) return;

        function openMobileMenu() {
            navMenu.classList.add('open');
            menuToggleBtn.innerHTML = '&times;';
            menuToggleBtn.setAttribute('aria-expanded', 'true');

            if (navOverlay) {
                navOverlay.classList.add('active');
                navOverlay.setAttribute('aria-hidden', 'false');
            }

            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
            navMenu.querySelector('a')?.focus();
        }

        menuToggleBtn.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) closeMobileMenu(true);
            else openMobileMenu();
        });

        navOverlay?.addEventListener('click', () => closeMobileMenu(true));

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => closeMobileMenu());
        });

        document.addEventListener('keydown', e => {
            if (!navMenu.classList.contains('open')) return;

            if (e.key === 'Escape') {
                closeMobileMenu(true);
                return;
            }

            if (e.key !== 'Tab') return;
            const focusables = [menuToggleBtn, ...navMenu.querySelectorAll('a')]
                .filter(el => el.offsetParent !== null);
            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
            if (e.matches) closeMobileMenu();
        });
    };
})();
