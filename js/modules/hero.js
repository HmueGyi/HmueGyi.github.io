/* ============================================================
   hero.js — mouse parallax on the mascot + light blobs,
   scroll parallax on the about photo
   ============================================================ */

function initHeroParallax() {
    const heroSection = document.querySelector('.hero');
    const robotWrap = document.querySelector('.robot-wrap');
    const heroBlobs = document.querySelectorAll('.hero-blob');

    let rafId = null;
    let running = false;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    function animate() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        if (robotWrap) {
            robotWrap.style.transform = `translate(${currentX * 14}px, ${currentY * 10}px)`;
        }

        heroBlobs.forEach((blob, i) => {
            const factor = i === 0 ? -0.5 : 0.35;
            blob.style.transform = `translate(${currentX * 30 * factor}px, ${currentY * 20 * factor}px)`;
        });

        rafId = requestAnimationFrame(animate);
    }

    function start() {
        if (running || !heroSection || !robotWrap) return;
        running = true;
        animate();
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
        rafId = null;
        currentX = currentY = targetX = targetY = 0;
        robotWrap.style.transform = '';
        heroBlobs.forEach(b => { b.style.transform = ''; });
    }

    if (heroSection && robotWrap) {
        heroSection.addEventListener('mousemove', e => {
            if (!running) return;
            const rect = heroSection.getBoundingClientRect();
            targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        });

        heroSection.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(rafId);
            else if (running) animate();
        });

        onMotionChange(reduced => (reduced ? stop() : start()));

        if (!prefersReducedMotion) start();
    }
}

function initAboutParallax() {
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
        if (prefersReducedMotion || ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    onMotionChange(reduced => {
        if (reduced) aboutPhoto.style.transform = '';
    });
}
