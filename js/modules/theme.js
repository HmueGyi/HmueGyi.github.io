import { toggleThemeBtn, icon } from './elements.js';
import { closeMobileMenu } from './menu.js';

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let savedTheme = localStorage.getItem('theme');

if (!savedTheme) {
    savedTheme = systemPrefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', savedTheme);
}

export function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        if (icon) icon.innerHTML = `
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            d="M12 4v1M12 19v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M19 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
        `;
    } else {
        document.body.classList.remove('light');
        if (icon) icon.innerHTML = `
            <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />
        `;
    }
}

export function initTheme() {
    applyTheme(savedTheme);

    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            closeMobileMenu();
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}
