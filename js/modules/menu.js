function closeMobileMenu() {
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
}

function initMenu() {
    if (menuToggleBtn && navMenu) {
        const overlay = document.getElementById('nav-overlay');

        menuToggleBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggleBtn.innerHTML = isOpen ? '&times;' : '&#9776;';
            menuToggleBtn.setAttribute('aria-expanded', String(isOpen));

            // Show/hide backdrop overlay
            if (overlay) {
                if (isOpen) {
                    overlay.classList.add('active');
                    overlay.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden'; // Prevent scroll behind menu
                } else {
                    overlay.classList.remove('active');
                    overlay.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                }
            }
        });

        // Close on overlay click (tap outside)
        overlay?.addEventListener('click', closeMobileMenu);

        // Close when nav link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Escape key closes menu
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeMobileMenu();
        });
    }
}
