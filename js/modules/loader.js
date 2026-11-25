/* ============================================================
   loader.js — page loader + section reveal (IntersectionObserver)
   ============================================================ */

function initLoader() {
    const loader = document.getElementById('page-loader');
    let pageRevealed = false;

    function revealPage() {
        // Guard: the load event and the safety fallback must not both run
        if (pageRevealed) return;
        pageRevealed = true;

        if (loader) loader.classList.add('loaded');
        document.body.classList.add('page-ready');
        window.__pageRevealed = true;
    }

    if (loader && !prefersReducedMotion) {
        const minDelay = 900; // ms — matches loader bar animation
        const start = Date.now();
        window.addEventListener('load', () => {
            const elapsed = Date.now() - start;
            setTimeout(revealPage, Math.max(0, minDelay - elapsed));
        });
        // Safety fallback: never block > 1.2s
        setTimeout(revealPage, 1200);
    } else {
        revealPage();
    }
}

function initReveal() {
    const reveal = el => {
        if (el.dataset.revealDone) return;
        el.dataset.revealDone = '1';
        el.classList.add('in-view');
        el.style.opacity = '1';
        el.style.transform = 'none';
    };

    const showAll = () => {
        document.querySelectorAll('[data-reveal], .reveal').forEach(reveal);
        document.querySelectorAll('section h3').forEach(h => h.classList.add('in-view'));
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        showAll();
        return;
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                reveal(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal], .reveal').forEach(el => io.observe(el));

    // Section headings get .in-view for the underline animation only
    const h3Observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                h3Observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('section h3').forEach(h => h3Observer.observe(h));

    // If the motion preference flips mid-session, stop hiding content
    onMotionChange(reduced => {
        if (reduced) {
            io.disconnect();
            h3Observer.disconnect();
            showAll();
        }
    });
}
