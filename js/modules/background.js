/* ============================================================
   background.js — animated particle + connecting-line canvas
   ============================================================ */

function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles, rafId = null, running = false;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticles() {
        const count = Math.min(55, Math.floor((W * H) / 22000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            alpha: Math.random() * 0.4 + 0.1
        }));
    }

    function isLight() {
        return document.documentElement.classList.contains('light');
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const particleColor = isLight() ? '8,123,169' : '53,185,242';
        const lineColor = isLight() ? '29,78,216' : '76,141,255';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -10) p.x = W + 10;
            else if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            else if (p.y > H + 10) p.y = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor},${p.alpha})`;
            ctx.fill();
        });

        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${lineColor},${(1 - dist / maxDist) * 0.12})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        rafId = requestAnimationFrame(draw);
    }

    function start() {
        if (running || prefersReducedMotion) return;
        running = true;
        resize();
        createParticles();
        draw();
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
        rafId = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', () => {
        clearTimeout(window._resizeTimer);
        window._resizeTimer = setTimeout(() => {
            if (!running) { resize(); return; }
            resize();
            createParticles();
        }, 200);
    });

    // Pause when the tab is hidden (saves battery, avoids a rAF backlog)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(rafId);
        else if (running) draw();
    });

    onMotionChange(reduced => (reduced ? stop() : start()));

    start();
}
