/* ============================================================
   nav.js — full-width glass header, GPU sliding glow underline,
   active section link & border highlight, back-to-top, smooth scroll
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initNav = function initNav() {
        const headerEl = document.querySelector('header');
        const navMenu = P.dom.navMenu;
        const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        const { backToTop } = P.dom;

        let navUnderline = null;
        let activeLink = null;
        let hoveredLink = null;
        let ticking = false;

        if (navMenu && navLinks.length) {
            navUnderline = document.createElement('span');
            navUnderline.className = 'nav-underline';
            navUnderline.setAttribute('aria-hidden', 'true');
            navMenu.appendChild(navUnderline);
        }

        function moveUnderlineTo(link) {
            if (!navUnderline || !link || window.innerWidth <= 768) {
                navUnderline?.classList.remove('visible');
                return;
            }
            const width = link.offsetWidth * 0.68;
            const left = link.offsetLeft + link.offsetWidth * 0.16;
            const top = link.offsetTop + link.offsetHeight - 3;
            const scaleX = width / 100; // base CSS width is 100px for GPU-only scaleX
            navUnderline.style.transform = `translate3d(${left}px, ${top}px, 0) scaleX(${scaleX})`;
            navUnderline.classList.add('visible');
        }

        function update() {
            const scrollY = window.scrollY;
            headerEl?.classList.toggle('scrolled', scrollY > 60);
            backToTop?.classList.toggle('show', scrollY > 480);

            let current = sections[0]?.id || '';
            const probe = scrollY + 160;
            sections.forEach(sec => {
                if (sec.offsetTop <= probe) current = sec.id;
            });

            sections.forEach(sec => {
                sec.classList.toggle('section-active', sec.id === current);
            });

            let matched = null;
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href').slice(1) === current;
                link.classList.toggle('nav-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                    matched = link;
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            activeLink = matched;
            if (!hoveredLink) moveUnderlineTo(activeLink);
            ticking = false;
        }

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                hoveredLink = link;
                moveUnderlineTo(link);
            });
        });

        navMenu?.addEventListener('mouseleave', () => {
            hoveredLink = null;
            moveUnderlineTo(activeLink);
        });

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        window.addEventListener('resize', () => {
            moveUnderlineTo(hoveredLink || activeLink);
        }, { passive: true });

        P.onPageRevealed(() => moveUnderlineTo(activeLink));
        update();

        backToTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: P.isReducedMotion() ? 'auto' : 'smooth' });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const id = anchor.getAttribute('href');
                if (!id || id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: P.isReducedMotion() ? 'auto' : 'smooth' });
                history.replaceState(null, '', id);
            });
        });
    };
})();
