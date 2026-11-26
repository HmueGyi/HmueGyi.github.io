/* ============================================================
   loader.js — page loader + section reveal (IntersectionObserver)
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initLoader = function initLoader() {
        const loader = document.getElementById('page-loader');

        function revealPage() {
            if (loader) loader.classList.add('loaded');
            document.body.classList.add('page-ready');
            P.markPageRevealed();
        }

        if (loader && !P.isReducedMotion()) {
            const minDelay = 580;
            const start = Date.now();
            window.addEventListener('load', () => {
                const elapsed = Date.now() - start;
                setTimeout(revealPage, Math.max(0, minDelay - elapsed));
            }, { once: true });
            setTimeout(revealPage, 900);
        } else {
            revealPage();
        }
    };

    P.modules.initReveal = function initReveal() {
        const reveal = el => {
            if (el.dataset.revealDone) return;
            el.dataset.revealDone = '1';
            el.classList.add('in-view');
            el.addEventListener('transitionend', e => {
                if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                    el.style.transitionDelay = '0s';
                }
            }, { once: true });
        };

        const showAll = () => {
            document.querySelectorAll('[data-reveal], .reveal').forEach(el => {
                el.dataset.revealDone = '1';
                el.classList.add('in-view');
                el.style.opacity = '1';
                el.style.filter = 'none';
                el.style.transform = 'none';
            });
            document.querySelectorAll('section h3').forEach(h => h.classList.add('in-view'));
        };

        if (P.isReducedMotion() || !('IntersectionObserver' in window)) {
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
        }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

        document.querySelectorAll('[data-reveal], .reveal').forEach(el => io.observe(el));

        const h3Observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    h3Observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('section h3').forEach(h => h3Observer.observe(h));

        P.onMotionChange(reduced => {
            if (reduced) {
                io.disconnect();
                h3Observer.disconnect();
                showAll();
            }
        });
    };
})();
