/* ============================================================
   cursor.js — sparkle trail + click burst on a full-screen canvas
   Skipped on touch devices, when motion is reduced, and on
   low-end hardware / data-saver where the cost is not worth it.
   ============================================================ */

function initCursorFX() {
    const canvas = document.getElementById('cursor-fx');
    if (!canvas) return;

    const canHover = window.matchMedia('(hover: hover)').matches;
    const lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    if (!canHover || lowEnd || saveData) {
        canvas.remove();
        return;
    }

    const ctx = canvas.getContext('2d');
    const COLORS = [
        'rgba(59,130,246,',    // electric blue
        'rgba(96,165,250,',    // lighter blue
        'rgba(16,185,129,',    // emerald accent
        'rgba(52,211,153,',    // lighter emerald
        'rgba(167,139,250,',   // soft violet
        'rgba(251,191,36,',    // warm gold
    ];

    const particles = [];
    let rafId = null;
    let running = false;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function createParticle(x, y, { burst = false } = {}) {
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? Math.random() * 5.5 + 2.5 : Math.random() * 1.8 + 0.4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: burst ? Math.random() * 3.5 + 1.5 : Math.random() * 2.2 + 0.8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: burst ? 0.85 : 0.65,
            decay: burst ? Math.random() * 0.018 + 0.012 : Math.random() * 0.022 + 0.016,
            gravity: burst ? 0.12 : 0.04,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.25,
            isStar: Math.random() > 0.55,
        });
    }

    function drawStar(x, y, r, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const innerAngle = angle + Math.PI / 4;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            ctx.lineTo(Math.cos(innerAngle) * r * 0.4, Math.sin(innerAngle) * r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.alpha -= p.decay;
            p.rotation += p.rotationSpeed;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = p.color + p.alpha + ')';
            if (p.isStar) drawStar(p.x, p.y, p.size, p.rotation);
            else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        rafId = requestAnimationFrame(render);
    }

    function start() {
        if (running) return;
        running = true;
        render();
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
        rafId = null;
        particles.length = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let lastTrail = 0;
    document.addEventListener('mousemove', e => {
        if (!running) return;
        const now = Date.now();
        if (now - lastTrail < 30) return; // ~33 spawns per second
        lastTrail = now;
        const count = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < count; i++) createParticle(e.clientX, e.clientY);
    });

    document.addEventListener('click', e => {
        if (!running) return;
        const count = 14 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) createParticle(e.clientX, e.clientY, { burst: true });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(rafId);
        else if (running) render();
    });

    onMotionChange(reduced => (reduced ? stop() : start()));

    start();
}
