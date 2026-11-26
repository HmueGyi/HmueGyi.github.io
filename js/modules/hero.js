/* ============================================================
   hero.js — mouse parallax on mascot wrapper + ambient blobs,
   scroll parallax on the about photo
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initHeroParallax = function initHeroParallax() {
        const heroSection = document.querySelector('.hero');
        const robotParallax = document.querySelector('.robot-parallax');
        const heroBlobs = document.querySelectorAll('.hero-blob');
        if (!heroSection || !robotParallax) return;

        let rafId = null;
        let running = false;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        function animate() {
            currentX += (targetX - currentX) * 0.065;
            currentY += (targetY - currentY) * 0.065;

            robotParallax.style.transform = `translate3d(${currentX * 14}px, ${currentY * 10}px, 0)`;

            heroBlobs.forEach((blob, i) => {
                const factor = i === 0 ? -0.5 : 0.35;
                blob.style.transform = `translate3d(${currentX * 28 * factor}px, ${currentY * 18 * factor}px, 0)`;
            });

            rafId = requestAnimationFrame(animate);
        }

        function start() {
            if (running || P.isReducedMotion()) return;
            running = true;
            rafId = requestAnimationFrame(animate);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
            rafId = null;
            currentX = currentY = targetX = targetY = 0;
            robotParallax.style.transform = '';
            heroBlobs.forEach(b => { b.style.transform = ''; });
        }

        heroSection.addEventListener('mousemove', e => {
            if (!running) return;
            const rect = heroSection.getBoundingClientRect();
            targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        }, { passive: true });

        heroSection.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
                rafId = null;
            } else if (running && !rafId) {
                rafId = requestAnimationFrame(animate);
            }
        });

        P.onMotionChange(reduced => (reduced ? stop() : start()));
        start();

        const robotWrap = document.querySelector('.robot-wrap');
        let pulseTimer = null;
        robotWrap?.addEventListener('click', () => {
            if (P.isReducedMotion()) return;
            robotWrap.classList.remove('pulse-active');
            void robotWrap.offsetWidth;
            robotWrap.classList.add('pulse-active');
            clearTimeout(pulseTimer);
            pulseTimer = setTimeout(() => robotWrap.classList.remove('pulse-active'), 720);
        });
    };

    P.modules.initAboutParallax = function initAboutParallax() {
        const aboutPhoto = document.querySelector('.about-photo');
        if (!aboutPhoto) return;

        let ticking = false;

        function update() {
            const rect = aboutPhoto.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const offset = (center - window.innerHeight / 2) * 0.04;
            aboutPhoto.style.transform = `translateY(${offset}px)`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (P.isReducedMotion() || ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        P.onMotionChange(reduced => {
            if (reduced) aboutPhoto.style.transform = '';
        });
    };
})();
