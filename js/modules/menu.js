/* ================== Mobile navigation menu ==================
   Overlay drawer with a focus trap: while it is open, Tab stays inside
   the menu, and focus returns to the toggle button when it closes. */

function closeMobileMenu(returnFocus = false) {
    const wasOpen = navMenu?.classList.contains('open');
    navMenu?.classList.remove('open');
    if (menuToggleBtn) {
        menuToggleBtn.innerHTML = '&#9776;'; // ☰
        menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
    // Hide overlay
    const overlay = document.getElementById('nav-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    if (wasOpen && returnFocus) menuToggleBtn?.focus();
}

function initMenu() {
    if (!menuToggleBtn || !navMenu) return;

    const overlay = document.getElementById('nav-overlay');

    function openMobileMenu() {
        navMenu.classList.add('open');
        menuToggleBtn.innerHTML = '&times;';
        menuToggleBtn.setAttribute('aria-expanded', 'true');
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden'; // prevent scroll behind menu
        // Move focus to the first link so keyboard users are inside the drawer
        navMenu.querySelector('a')?.focus();
    }

    menuToggleBtn.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) closeMobileMenu(true);
        else openMobileMenu();
    });

    // Tap outside to close
    overlay?.addEventListener('click', () => closeMobileMenu(true));

    // Close when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeMobileMenu());
    });

    document.addEventListener('keydown', e => {
        if (!navMenu.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeMobileMenu(true);
            return;
        }

        // Focus trap inside the open drawer
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

    // Closing the drawer when the viewport grows to desktop size
    window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
        if (e.matches) closeMobileMenu();
    });
}
