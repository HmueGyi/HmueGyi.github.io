/* ============================================================
   interactions.js — the small stuff:
   scroll progress bar, 3-D project card tilt, magnetic skill
   icons, footer year
   ============================================================ */

function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    let ticking = false;

    function update() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    update();
}

function initCardTilt() {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice || !tiltCards.length) return;

    let lastMove = 0;
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            if (prefersReducedMotion) return;
            const now = Date.now();
            if (now - lastMove < 16) return; // ~60fps
            lastMove = now;

            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;

            card.style.transform =
                `perspective(900px) rotateX(${(0.5 - py) * 4}deg) rotateY(${(px - 0.5) * 6}deg) ` +
                `translate(${(px - 0.5) * 2.5}px, ${(py - 0.5) * 2.5}px) scale3d(1.01, 1.01, 1.01)`;
            card.style.transition = 'transform 0.16s ease-out, box-shadow 0.35s ease, border-color 0.35s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'var(--transition-smooth)';
            card.style.transform = '';
        });
    });
}

function initMagneticSkills() {
    document.querySelectorAll('.skills-logos .icon-wrapper').forEach(wrapper => {
        const parent = wrapper.closest('a');
        if (!parent) return;

        parent.addEventListener('mousemove', e => {
            if (prefersReducedMotion) return;
            const rect = wrapper.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
            const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
            wrapper.style.transform =
                `translateY(-12px) scale(1.08) rotate(-3deg) translate(${dx}px, ${dy}px)`;
        });

        parent.addEventListener('mouseleave', () => {
            wrapper.style.transform = '';
        });
    });
}

function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}
