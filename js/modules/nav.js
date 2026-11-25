/* ============================================================
   nav.js — sticky header state, active section link,
   back-to-top button, smooth scrolling
   ============================================================ */

function initNav() {
    const headerEl = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function updateNavbar() {
        if (!headerEl) return;
        headerEl.classList.toggle('scrolled', window.scrollY > 60);
    }

    function updateActiveLink() {
        let current = '';
        const scrollY = window.scrollY + 140;

        sections.forEach(sec => {
            if (sec.offsetTop <= scrollY) current = sec.id;
        });

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href').slice(1) === current;
            link.classList.toggle('nav-active', isActive);
            // Screen readers: announce which section you are in
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    function onScroll() {
        updateNavbar();
        updateActiveLink();
        if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    // Smooth scroll for in-page links (CSS handles it too; this keeps focus sane)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const id = anchor.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            history.replaceState(null, '', id);
        });
    });
}
