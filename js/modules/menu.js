function closeMobileMenu() {
    navMenu?.classList.remove('open');
    if (menuToggleBtn) menuToggleBtn.textContent = '☰';
}

function initMenu() {
    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggleBtn.textContent = menuToggleBtn.textContent.trim() === '☰' ? '×' : '☰';
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
