/* ============================================================
   background.js — dual-atmosphere canvas:
   - Night mode: multi-layered twinkling stars + subtle shooting star
   - Light mode: interactive dot-matrix neural wave + sunlit bokeh & sparkle dust
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initBackground = function initBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const STAR_PALETTE = [
            '235, 244, 255', // crisp starlight white
            '135, 215, 255', // cyan-blue star
            '176, 194, 255', // pale indigo star
            '255, 232, 198'  // subtle warm star
        ];
        const LIGHT_DUST_PALETTE = [
            '255, 255, 255', // pearl white
            '125, 211, 252', // ice cyan
            '165, 180, 252', // soft indigo
            '56, 189, 248'   // sky cerulean
        ];

        let width = 0;
        let height = 0;
        let dpr = 1;
        let stars = [];
        let lightDust = [];
        let gridCols = 0;
        let gridRows = 0;
        let gridStep = 44;
        let gridOffsetX = 0;
        let gridOffsetY = 0;
        let shootingStar = null;
        let nextMeteorAt = 0;
        let rafId = null;
        let running = false;
        let currentMode = P.isLightTheme() ? 'light' : 'dark';

        // Normalized parallax pointer (-1..1) + pixel pointer for interactive matrix
        let pointerX = 0;
        let pointerY = 0;
        let smoothX = 0;
        let smoothY = 0;
        let cursorX = -9999;
        let cursorY = -9999;
        let smoothCursorX = -9999;
        let smoothCursorY = -9999;
        let cursorStrength = 0;
        let pointerInside = false;
        let resizeTimer = null;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seedStars() {
            const count = Math.min(135, Math.max(55, Math.floor((width * height) / 11500)));
            stars = Array.from({ length: count }, () => {
                const z = 0.25 + Math.random() * 0.75;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z,
                    r: 0.55 + z * 1.45,
                    baseAlpha: 0.25 + z * 0.62,
                    phase: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.8 + Math.random() * 2.2,
                    vx: (Math.random() - 0.5) * 0.06 * z,
                    vy: -(0.03 + Math.random() * 0.08) * z,
                    color: STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)],
                    sparkle: z > 0.78 && Math.random() > 0.35
                };
            });
            shootingStar = null;
            nextMeteorAt = performance.now() + 3500 + Math.random() * 5000;
        }

        function seedLightAtmosphere() {
            gridStep = width < 640 ? 48 : 42;
            gridCols = Math.ceil(width / gridStep) + 1;
            gridRows = Math.ceil(height / gridStep) + 1;
            gridOffsetX = (width - (gridCols - 1) * gridStep) * 0.5;
            gridOffsetY = (height - (gridRows - 1) * gridStep) * 0.5;

            const dustCount = Math.min(68, Math.max(30, Math.floor((width * height) / 22000)));
            lightDust = Array.from({ length: dustCount }, () => {
                const z = 0.25 + Math.random() * 0.75;
                const isBokeh = Math.random() > 0.45;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z,
                    r: isBokeh ? 2.4 + z * 4.2 : 1.0 + z * 1.6,
                    vx: (Math.random() - 0.5) * 0.16 * z,
                    vy: -(0.12 + Math.random() * 0.22) * z,
                    swayAmp: 0.12 + z * 0.24,
                    swaySpeed: 0.45 + Math.random() * 0.9,
                    phase: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.9 + Math.random() * 1.8,
                    baseAlpha: isBokeh ? 0.22 + z * 0.28 : 0.32 + z * 0.42,
                    color: LIGHT_DUST_PALETTE[Math.floor(Math.random() * LIGHT_DUST_PALETTE.length)],
                    isBokeh,
                    isSparkle: !isBokeh && z > 0.65 && Math.random() > 0.3
                };
            });
        }

        function populateForTheme() {
            currentMode = P.isLightTheme() ? 'light' : 'dark';
            if (currentMode === 'light') seedLightAtmosphere();
            else seedStars();
        }

        function drawSparkleCross(x, y, size, color, alpha, lineWidth = 0.9) {
            ctx.save();
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(x - size, y);
            ctx.lineTo(x + size, y);
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
            ctx.stroke();
            ctx.restore();
        }

        function drawStars(now) {
            const t = now * 0.001;

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.x += s.vx;
                s.y += s.vy;

                if (s.x < -8) s.x = width + 8;
                else if (s.x > width + 8) s.x = -8;
                if (s.y < -8) s.y = height + 8;

                const px = s.x + smoothX * 14 * s.z;
                const py = s.y + smoothY * 14 * s.z;
                const twinkle = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase));
                const alpha = s.baseAlpha * twinkle;

                if (s.sparkle && twinkle > 0.68) {
                    const halo = ctx.createRadialGradient(px, py, 0, px, py, s.r * 4.2);
                    halo.addColorStop(0, `rgba(${s.color}, ${alpha * 0.55})`);
                    halo.addColorStop(1, `rgba(${s.color}, 0)`);
                    ctx.fillStyle = halo;
                    ctx.beginPath();
                    ctx.arc(px, py, s.r * 4.2, 0, Math.PI * 2);
                    ctx.fill();

                    drawSparkleCross(px, py, s.r * 2.9 * twinkle, s.color, alpha * 0.7);
                }

                ctx.beginPath();
                ctx.arc(px, py, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
                ctx.fill();
            }

            // Occasional subtle shooting star across the upper sky
            if (!shootingStar && now >= nextMeteorAt) {
                shootingStar = {
                    x: width * (0.15 + Math.random() * 0.65),
                    y: height * (0.06 + Math.random() * 0.28),
                    vx: 7.5 + Math.random() * 3.5,
                    vy: 2.8 + Math.random() * 1.8,
                    life: 0,
                    maxLife: 38
                };
                nextMeteorAt = now + 6000 + Math.random() * 7000;
            }

            if (shootingStar) {
                const m = shootingStar;
                m.x += m.vx;
                m.y += m.vy;
                m.life += 1;

                const progress = m.life / m.maxLife;
                const alpha = Math.sin(progress * Math.PI) * 0.72;
                const tailX = m.x - m.vx * 6.5;
                const tailY = m.y - m.vy * 6.5;

                const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
                grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                grad.addColorStop(1, `rgba(235, 244, 255, ${alpha})`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(m.x, m.y);
                ctx.stroke();

                if (m.life >= m.maxLife) shootingStar = null;
            }
        }

        function drawLightAtmosphere(now) {
            const t = now * 0.001;
            const interactRadius = 175;
            const interactRadiusSq = interactRadius * interactRadius;
            const activeNodes = [];

            // Smoothly fade interactive pointer halo in/out
            cursorStrength += ((pointerInside ? 1 : 0) - cursorStrength) * 0.08;
            if (pointerInside) {
                if (smoothCursorX < -500) {
                    smoothCursorX = cursorX;
                    smoothCursorY = cursorY;
                } else {
                    smoothCursorX += (cursorX - smoothCursorX) * 0.14;
                    smoothCursorY += (cursorY - smoothCursorY) * 0.14;
                }
            }

            // 1. Interactive Dot-Matrix / Neural Wave
            for (let row = 0; row < gridRows; row++) {
                const baseY = gridOffsetY + row * gridStep;
                for (let col = 0; col < gridCols; col++) {
                    const baseX = gridOffsetX + col * gridStep;
                    const wave = Math.sin(baseX * 0.011 + baseY * 0.011 - t * 0.9);
                    const waveLift = wave * 2.2;
                    const x = baseX + smoothX * 4;
                    const y = baseY + waveLift + smoothY * 4;

                    let boost = 0;
                    if (cursorStrength > 0.02) {
                        const dx = x - smoothCursorX;
                        const dy = y - smoothCursorY;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < interactRadiusSq) {
                            boost = (1 - Math.sqrt(distSq) / interactRadius) * cursorStrength;
                            if (boost > 0.2) activeNodes.push({ x, y, boost });
                        }
                    }

                    const waveNorm = 0.5 + 0.5 * wave;
                    const radius = 1.0 + waveNorm * 0.45 + boost * 1.65;
                    const alpha = 0.075 + waveNorm * 0.065 + boost * 0.38;

                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = boost > 0.05
                        ? `rgba(2, 132, 199, ${alpha})`
                        : `rgba(79, 98, 138, ${alpha})`;
                    ctx.fill();
                }
            }

            // Subtle neural connections between energized dots around the pointer
            if (activeNodes.length > 1) {
                const maxLinkSq = (gridStep * 1.55) * (gridStep * 1.55);
                ctx.lineWidth = 0.85;
                for (let i = 0; i < activeNodes.length; i++) {
                    const a = activeNodes[i];
                    for (let j = i + 1; j < activeNodes.length; j++) {
                        const b = activeNodes[j];
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const dSq = dx * dx + dy * dy;
                        if (dSq < maxLinkSq) {
                            const strength = Math.min(a.boost, b.boost) * (1 - Math.sqrt(dSq) / (gridStep * 1.55));
                            ctx.strokeStyle = `rgba(79, 70, 229, ${strength * 0.24})`;
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                }
            }

            // 2. Sunlit Bokeh & Tiny Sparkle Dust
            for (let i = 0; i < lightDust.length; i++) {
                const d = lightDust[i];
                d.x += d.vx + Math.sin(t * d.swaySpeed + d.phase) * d.swayAmp;
                d.y += d.vy;

                if (d.y < -12) {
                    d.y = height + 12;
                    d.x = Math.random() * width;
                }
                if (d.x < -12) d.x = width + 12;
                else if (d.x > width + 12) d.x = -12;

                const px = d.x + smoothX * 11 * d.z;
                const py = d.y + smoothY * 11 * d.z;
                const pulse = 0.52 + 0.48 * (0.5 + 0.5 * Math.sin(t * d.twinkleSpeed + d.phase));
                const alpha = d.baseAlpha * pulse;

                if (d.isBokeh) {
                    const orb = ctx.createRadialGradient(px, py, 0, px, py, d.r * 2.2);
                    orb.addColorStop(0, `rgba(${d.color}, ${alpha})`);
                    orb.addColorStop(0.65, `rgba(125, 211, 252, ${alpha * 0.35})`);
                    orb.addColorStop(1, 'rgba(125, 211, 252, 0)');
                    ctx.fillStyle = orb;
                    ctx.beginPath();
                    ctx.arc(px, py, d.r * 2.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    if (d.isSparkle && pulse > 0.72) {
                        drawSparkleCross(px, py, d.r * 2.8 * pulse, '2, 132, 199', alpha * 0.55, 0.85);
                    }
                    ctx.beginPath();
                    ctx.arc(px, py, d.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${d.color}, ${alpha})`;
                    ctx.fill();
                }
            }
        }

        function render(now) {
            if (!running) return;
            smoothX += (pointerX - smoothX) * 0.035;
            smoothY += (pointerY - smoothY) * 0.035;

            ctx.clearRect(0, 0, width, height);

            if (currentMode === 'light') drawLightAtmosphere(now);
            else drawStars(now);

            rafId = requestAnimationFrame(render);
        }

        function start() {
            if (running || P.isReducedMotion()) return;
            running = true;
            resize();
            populateForTheme();
            rafId = requestAnimationFrame(render);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
            rafId = null;
            ctx.clearRect(0, 0, width, height);
        }

        if (window.matchMedia('(hover: hover)').matches) {
            window.addEventListener('mousemove', e => {
                if (!running || width === 0 || height === 0) return;
                pointerX = (e.clientX / width - 0.5) * 2;
                pointerY = (e.clientY / height - 0.5) * 2;
                cursorX = e.clientX;
                cursorY = e.clientY;
                pointerInside = true;
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                pointerInside = false;
            });
        }

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                if (running) populateForTheme();
            }, 200);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
                rafId = null;
            } else if (running && !rafId) {
                rafId = requestAnimationFrame(render);
            }
        });

        P.onThemeChange(() => {
            if (!running) {
                currentMode = P.isLightTheme() ? 'light' : 'dark';
                return;
            }
            populateForTheme();
        });

        P.onMotionChange(reduced => (reduced ? stop() : start()));

        start();
    };
})();
