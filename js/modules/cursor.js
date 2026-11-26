/* ============================================================
   cursor.js — theme-aware sparkle trail, click burst, and
   smooth custom halo ring on hover targets (desktop only)
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initCursorFX = function initCursorFX() {
        const canvas = document.getElementById('cursor-fx');
        if (!canvas) return;

        const canHover = window.matchMedia('(hover: hover)').matches;
        const lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const saveData = !!(navigator.connection && navigator.connection.saveData);
        if (!canHover || lowEnd || saveData) {
            canvas.remove();
            return;
        }

        const ctx = canvas.getContext('2d');
        const DARK_COLORS = [
            'rgba(56, 189, 248,',
            'rgba(125, 211, 252,',
            'rgba(99, 102, 241,',
            'rgba(45, 212, 191,',
            'rgba(235, 244, 255,'
        ];
        const LIGHT_COLORS = [
            'rgba(2, 132, 199,',
            'rgba(79, 70, 229,',
            'rgba(14, 165, 233,',
            'rgba(13, 148, 136,',
            'rgba(148, 197, 248,'
        ];
        const INTERACTIVE_SELECTOR = 'a, button, .project-card, input, textarea, .robot-wrap';

        const particles = [];
        let rafId = null;
        let enabled = !P.isReducedMotion();
        let lastTrail = 0;

        let pointerInside = false;
        let mouseX = -100;
        let mouseY = -100;
        let haloX = -100;
        let haloY = -100;
        let haloRadius = 14;
        let haloAlpha = 0;
        let hoveringInteractive = false;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        function createParticle(x, y, { burst = false } = {}) {
            const palette = P.isLightTheme() ? LIGHT_COLORS : DARK_COLORS;
            const angle = Math.random() * Math.PI * 2;
            const speed = burst ? Math.random() * 4.8 + 2.0 : Math.random() * 1.4 + 0.35;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: burst ? Math.random() * 3.2 + 1.4 : Math.random() * 2.1 + 0.8,
                color: palette[Math.floor(Math.random() * palette.length)],
                alpha: burst ? 0.8 : 0.55,
                decay: burst ? Math.random() * 0.02 + 0.015 : Math.random() * 0.025 + 0.018,
                gravity: burst ? 0.1 : 0.03,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.22,
                isStar: Math.random() > 0.5
            });
            ensureLoop();
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
                ctx.lineTo(Math.cos(innerAngle) * r * 0.38, Math.sin(innerAngle) * r * 0.38);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smooth trailing halo ring
            const targetAlpha = pointerInside ? (hoveringInteractive ? 0.45 : 0.22) : 0;
            const targetRadius = hoveringInteractive ? 23 : 13;
            haloAlpha += (targetAlpha - haloAlpha) * 0.14;
            haloRadius += (targetRadius - haloRadius) * 0.16;
            if (pointerInside) {
                haloX += (mouseX - haloX) * 0.18;
                haloY += (mouseY - haloY) * 0.18;
            }

            if (haloAlpha > 0.01) {
                const ringColor = P.isLightTheme() ? '2, 132, 199' : '56, 189, 248';
                ctx.save();
                ctx.beginPath();
                ctx.arc(haloX, haloY, haloRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${ringColor}, ${haloAlpha})`;
                ctx.lineWidth = hoveringInteractive ? 1.5 : 1.1;
                if (hoveringInteractive) {
                    ctx.fillStyle = `rgba(${ringColor}, 0.05)`;
                    ctx.fill();
                }
                ctx.stroke();
                ctx.restore();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.965;
                p.alpha -= p.decay;
                p.rotation += p.rotationSpeed;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.fillStyle = p.color + p.alpha + ')';
                if (p.isStar) {
                    drawStar(p.x, p.y, p.size, p.rotation);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            const keepRunning = (particles.length > 0 || pointerInside || haloAlpha > 0.01)
                && enabled && !document.hidden;
            if (keepRunning) {
                rafId = requestAnimationFrame(render);
            } else {
                rafId = null;
            }
        }

        function ensureLoop() {
            if (!rafId && enabled && !document.hidden) {
                rafId = requestAnimationFrame(render);
            }
        }

        document.addEventListener('mousemove', e => {
            if (!enabled) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!pointerInside) {
                haloX = mouseX;
                haloY = mouseY;
                pointerInside = true;
            }
            hoveringInteractive = !!(e.target && e.target.closest && e.target.closest(INTERACTIVE_SELECTOR));
            ensureLoop();

            const now = performance.now();
            if (now - lastTrail < 34) return;
            lastTrail = now;
            createParticle(e.clientX, e.clientY);
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            pointerInside = false;
            hoveringInteractive = false;
        });

        document.addEventListener('click', e => {
            if (!enabled) return;
            const count = 12 + Math.floor(Math.random() * 6);
            for (let i = 0; i < count; i++) createParticle(e.clientX, e.clientY, { burst: true });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            } else if (!document.hidden && (particles.length > 0 || pointerInside)) {
                ensureLoop();
            }
        });

        P.onMotionChange(reduced => {
            enabled = !reduced;
            if (reduced) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                particles.length = 0;
                haloAlpha = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    };
})();
