/* ============================================================
   interactions.js — scroll progress bar + circular ring,
   3-D project card tilt with cursor spotlight & depth layers,
   magnetic skill icons & CTA buttons, footer year
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initScrollProgress = function initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        const ringFill = document.querySelector('.btt-ring-fill');
        const circumference = 2 * Math.PI * 23; // matches r="23" in index.html
        if (!progressBar && !ringFill) return;

        if (ringFill) {
            ringFill.style.strokeDasharray = String(circumference);
        }

        let ticking = false;

        function update() {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;

            if (progressBar) {
                progressBar.style.transform = `scaleX(${ratio})`;
            }
            if (ringFill) {
                ringFill.style.strokeDashoffset = String(circumference * (1 - ratio));
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        update();
    };

    P.modules.initCardTilt = function initCardTilt() {
        const isTouchDevice = window.matchMedia('(hover: none)').matches;
        const { tiltCards } = P.dom;
        if (isTouchDevice || !tiltCards.length) return;

        tiltCards.forEach(card => {
            let lastMove = 0;

            card.addEventListener('mousemove', e => {
                if (P.isReducedMotion()) return;
                const now = performance.now();
                if (now - lastMove < 16) return;
                lastMove = now;

                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;

                card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
                card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
                card.style.setProperty('--px', px.toFixed(3));
                card.style.setProperty('--py', py.toFixed(3));
                card.style.transitionDelay = '0s';
                card.style.transition = 'transform 0.16s ease-out, box-shadow 0.35s ease, border-color 0.35s ease';
                card.style.transform =
                    `perspective(900px) rotateX(${(0.5 - py) * 4.5}deg) rotateY(${(px - 0.5) * 6.5}deg) ` +
                    `translate3d(${(px - 0.5) * 3}px, ${(py - 0.5) * 3}px, 0) scale3d(1.012, 1.012, 1.012)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--px', '0.5');
                card.style.setProperty('--py', '0.5');
                card.style.transitionDelay = '0s';
                card.style.transition = 'var(--transition-smooth)';
                card.style.transform = '';
            });
        });
    };

    P.modules.initMagneticSkills = function initMagneticSkills() {
        if (window.matchMedia('(hover: none)').matches) return;

        document.querySelectorAll('.skills-logos .icon-wrapper').forEach(wrapper => {
            const parent = wrapper.closest('a');
            if (!parent) return;

            parent.addEventListener('mousemove', e => {
                if (P.isReducedMotion()) return;
                const rect = wrapper.getBoundingClientRect();
                const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.16;
                const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.16;
                wrapper.style.transform =
                    `translateY(-10px) scale(1.07) rotate(-2.5deg) translate(${dx}px, ${dy}px)`;
            });

            parent.addEventListener('mouseleave', () => {
                wrapper.style.transform = '';
            });
        });
    };

    P.modules.initMagneticButtons = function initMagneticButtons() {
        if (window.matchMedia('(hover: none)').matches) return;

        document.querySelectorAll('.hero-cta .btn, .project-link.btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                if (P.isReducedMotion()) return;
                const rect = btn.getBoundingClientRect();
                const dx = Math.max(-10, Math.min(10, (e.clientX - (rect.left + rect.width / 2)) * 0.22));
                const dy = Math.max(-8, Math.min(8, (e.clientY - (rect.top + rect.height / 2)) * 0.22));
                btn.style.transform = `translate3d(${dx}px, ${dy - 3}px, 0) scale(1.02)`;
            });

            btn.addEventListener('mousedown', () => {
                if (P.isReducedMotion()) return;
                btn.style.transform = 'translate3d(0, -1px, 0) scale(0.96)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    };

    P.modules.initFooterYear = function initFooterYear() {
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    };
})();
