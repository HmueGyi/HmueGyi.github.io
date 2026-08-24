function closeMobileMenu() {
    navMenu?.classList.remove('open');
    if (menuToggleBtn) {
        menuToggleBtn.textContent = '☰';
        menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
}

function initMenu() {
    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggleBtn.textContent = isOpen ? '×' : '☰';
            menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', e => {
            if (!navMenu.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }
}
