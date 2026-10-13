/* ============================================================
   animations.js  —  Premium Motion Design Engine
    All animations are IntersectionObserver / timer based.
   Zero external libraries. Respects prefers-reduced-motion.
   ============================================================ */

function initAnimations() {

    /* ---- Guards ---- */
    const reduced = prefersReducedMotion;

    /* =====================================================
       0. SCROLL PROGRESS BAR
       ===================================================== */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = pct + '%';
        }
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }
    /* =====================================================
       1. PAGE LOADER
       ===================================================== */
    const loader = document.getElementById('page-loader');

    function revealPage() {
        if (loader) {
            loader.classList.add('loaded');
        }
        document.body.classList.add('page-ready');

        // Start typewriter only after page reveal
        if (!reduced && typewriterElement) {
            setTimeout(startTypewriter, 600);
        } else if (typewriterElement) {
            typewriterElement.textContent = 'Robotics & AI Architect';
        }
    }

    // Show page after short loader (never block more than 1s)
    if (loader && !reduced) {
        const minDelay = 900; // ms — matches loader bar animation
        const start = Date.now();
        window.addEventListener('load', () => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, minDelay - elapsed);
            setTimeout(revealPage, remaining);
        });
        // Safety fallback: never block > 1.2s
        setTimeout(revealPage, 1200);
    } else {
        // Reduced motion or no loader — reveal immediately
        revealPage();
    }


    // ================== Typewriter ==================
    if (!prefersReducedMotion && typewriterElement) {
        const phrases = [
            "Developing intelligent AI agents to assist in everyday tasks.",
            "Hands-on robotics with ROS, sensors, and autonomous navigation.",
            "Building robust AI systems using object detection and LLMs.",
            "Exploring perception, planning, and decision-making for smart machines."
        ];
        let phraseIndex = 0, charIndex = 0, isDeleting = false;
        const typingSpeed = 70, erasingSpeed = 36, delayBetween = 1600;

        function type() {
            const current = phrases[phraseIndex];
            if (!isDeleting) {
                typewriterElement.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    isDeleting = true;
                    setTimeout(type, delayBetween);
                } else {
                    setTimeout(type, typingSpeed + Math.random() * 40);
                }
            } else {
                typewriterElement.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(type, typingSpeed);
                } else {
                    setTimeout(type, erasingSpeed);
                }
            }
        }
        setTimeout(type, 700);
    } else if (typewriterElement) {
        typewriterElement.textContent = "Building smart AI models that solve real problems.";
    }

    /* =====================================================
       3. BACKGROUND PARTICLE CANVAS
       ===================================================== */
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !reduced) {
        const ctx = canvas.getContext('2d');
        let W, H, particles;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        function createParticles() {
            const count = Math.min(55, Math.floor(W * H / 22000));
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
            return document.body.classList.contains('light');
        }

        function drawParticles() {
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

            // Draw connecting lines
            const maxDist = 130;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        const lineAlpha = (1 - dist / maxDist) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${lineColor},${lineAlpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            rafId = requestAnimationFrame(drawParticles);
        }

        let rafId;

        function initCanvas() {
            resize();
            createParticles();
            cancelAnimationFrame(rafId);
            drawParticles();
        }

        window.addEventListener('resize', () => {
            clearTimeout(window._resizeTimer);
            window._resizeTimer = setTimeout(() => {
                resize();
                createParticles();
            }, 200);
        });

        initCanvas();

        // Pause when tab is hidden (performance)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(rafId);
            else drawParticles();
        });
    }

    /* =====================================================
       4. CURSOR FIREWORKS (canvas-based)
       ===================================================== */
    const cursorCanvas = document.getElementById('cursor-fx');

    if (cursorCanvas && !reduced && window.matchMedia('(hover: hover)').matches) {
        const ctx2 = cursorCanvas.getContext('2d');

        // Resize canvas to viewport
        function resizeCursorCanvas() {
            cursorCanvas.width = window.innerWidth;
            cursorCanvas.height = window.innerHeight;
        }
        resizeCursorCanvas();
        window.addEventListener('resize', resizeCursorCanvas, { passive: true });

        // Palette: site colors
        const COLORS = [
            'rgba(59,130,246,',    // electric blue
            'rgba(96,165,250,',    // lighter blue
            'rgba(16,185,129,',    // emerald accent
            'rgba(52,211,153,',    // lighter emerald
            'rgba(167,139,250,',   // soft violet
            'rgba(251,191,36,',    // warm gold
        ];

        const particles = [];

        /* ---- Particle factory ---- */
        function createParticle(x, y, { burst = false } = {}) {
            const angle = Math.random() * Math.PI * 2;
            const speed = burst
                ? Math.random() * 5.5 + 2.5
                : Math.random() * 1.8 + 0.4;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = burst
                ? Math.random() * 3.5 + 1.5
                : Math.random() * 2.2 + 0.8;
            const life = burst ? 0.85 : 0.65;    // max alpha
            const decay = burst
                ? Math.random() * 0.018 + 0.012
                : Math.random() * 0.022 + 0.016;
            const gravity = burst ? 0.12 : 0.04;

            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                alpha: life,
                decay,
                gravity,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.25,
                isStar: Math.random() > 0.55,  // star vs circle
            });
        }

        /* ---- Draw a 4-point sparkle star ---- */
        function drawStar(ctx, x, y, r, rotation) {
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

        /* ---- Main render loop ---- */
        let fxRafId;
        function renderFX() {
            ctx2.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;    // gravity pull
                p.vx *= 0.97;         // air friction
                p.alpha -= p.decay;
                p.rotation += p.rotationSpeed;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx2.fillStyle = p.color + p.alpha + ')';

                if (p.isStar) {
                    drawStar(ctx2, p.x, p.y, p.size, p.rotation);
                } else {
                    ctx2.beginPath();
                    ctx2.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
                    ctx2.fill();
                }
            }

            fxRafId = requestAnimationFrame(renderFX);
        }
        renderFX();

        /* ---- Mouse move — sparkle trail (throttled) ---- */
        let lastTrail = 0;
        document.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastTrail < 30) return;   // ~33fps spawn rate
            lastTrail = now;
            // Spawn 1–2 trail sparkles
            const count = Math.random() > 0.6 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                createParticle(e.clientX, e.clientY);
            }
        });

        /* ---- Click — burst explosion ---- */
        document.addEventListener('click', e => {
            const count = 14 + Math.floor(Math.random() * 8);   // 14–21 particles
            for (let i = 0; i < count; i++) {
                createParticle(e.clientX, e.clientY, { burst: true });
            }
        });

        /* ---- Pause when tab hidden ---- */
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(fxRafId);
                particles.length = 0;
            } else {
                renderFX();
            }
        });
    }

    /* =====================================================
       5. NAVBAR — Scroll State + Active Section Tracking
       ===================================================== */
    const headerEl = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function updateNavbar() {
        if (!headerEl) return;
        if (window.scrollY > 60) headerEl.classList.add('scrolled');
        else headerEl.classList.remove('scrolled');
    }

    function updateActiveLink() {
        let current = '';
        const scrollY = window.scrollY + 140;

        sections.forEach(sec => {
            if (sec.offsetTop <= scrollY) current = sec.id;
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href').slice(1);
            link.classList.toggle('nav-active', href === current);
        });
    }

    window.addEventListener('scroll', () => {
        updateNavbar();
        updateActiveLink();
    }, { passive: true });

    updateNavbar();
    updateActiveLink();

    /* =====================================================
       6. SCROLL-TRIGGERED REVEAL  (IntersectionObserver)
       ===================================================== */
    function initReveal() {
        if (reduced) {
            // Ensure everything is visible
            document.querySelectorAll('[data-reveal]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            document.querySelectorAll('section h3').forEach(h => h.classList.add('in-view'));
            return;
        }

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

        // Section headings get in-view for underline animation
        const h3Observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    h3Observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('section h3').forEach(h => h3Observer.observe(h));
    }

    initReveal();

    /* Legacy .reveal support (keep backward compat) */
    if (!reduced) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    /* =====================================================
       7. HERO MOUSE PARALLAX
       ===================================================== */
    const heroSection = document.querySelector('.hero');
    const robotWrap = document.querySelector('.robot-wrap');
    const heroBlobs = document.querySelectorAll('.hero-blob');

    if (heroSection && robotWrap && !reduced) {
        let heroRafId;
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        heroSection.addEventListener('mousemove', e => {
            const rect = heroSection.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            targetX = (e.clientX - rect.left - cx) / cx;
            targetY = (e.clientY - rect.top - cy) / cy;
        });

        heroSection.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });

        function animateParallax() {
            currentX += (targetX - currentX) * 0.06;
            currentY += (targetY - currentY) * 0.06;

            // Subtle robot container translate on mouse (float lives on #robot-gif via CSS)
            const rx = currentX * 14;
            const ry = currentY * 10;
            robotWrap.style.transform = `translate(${rx}px, ${ry}px)`;

            // Blobs drift with mouse
            heroBlobs.forEach((blob, i) => {
                const factor = i === 0 ? -0.5 : 0.35;
                blob.style.transform = `translate(${currentX * 30 * factor}px, ${currentY * 20 * factor}px)`;
            });

            heroRafId = requestAnimationFrame(animateParallax);
        }
        animateParallax();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(heroRafId);
            else animateParallax();
        });
    }

    /* =====================================================
       8. PROJECT CARD TILT (3-D)  — desktop only
       ===================================================== */
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (!reduced && !isTouchDevice) {
        let lastMove = 0;
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const now = Date.now();
                if (now - lastMove < 16) return; // ~60fps throttle
                lastMove = now;

                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const rotY = (px - 0.5) * 6;
                const rotX = (0.5 - py) * 4;
                const tx = (px - 0.5) * 2.5;
                const ty = (py - 0.5) * 2.5;

                card.style.transform =
                    `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) ` +
                `translate(${tx}px, ${ty}px) scale3d(1.01, 1.01, 1.01)`;
                card.style.transition = 'transform 0.16s ease-out, box-shadow 0.35s ease, border-color 0.35s ease';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'var(--transition-smooth)';
                card.style.transform = '';
            });
        });
    }

    /* =====================================================
       9. BACK TO TOP
       ===================================================== */
    window.addEventListener('scroll', () => {
        if (backToTop) {
            backToTop.classList.toggle('show', window.scrollY > 500);
        }
    }, { passive: true });

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* =====================================================
       10. CONTACT FORM
       ===================================================== */
    contactForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('contactFormStatus');
        const formData = new URLSearchParams();
        new FormData(contactForm).forEach((value, key) => {
            formData.append(key, String(value));
        });

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        }
        if (status) {
            status.dataset.state = 'sending';
            status.textContent = 'Sending your message...';
        }

        try {
            const response = await fetch('https://formsubmit.co/ajax/hmuesett2002@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });
            const result = await response.json();

            if (!response.ok || (result.success !== true && result.success !== 'true')) {
                throw new Error(result.message || 'Message could not be sent.');
            }

            if (status) {
                status.dataset.state = 'success';
                status.textContent = 'Message sent. Thank you!';
            }
            contactForm.reset();
        } catch {
            if (status) {
                status.dataset.state = 'error';
                status.textContent = 'Could not send your message. Please try again.';
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send in Email';
            }
        }
    });

    /* =====================================================
       11. SMOOTH SCROLL for all anchor links
       ===================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* =====================================================
       12. FOOTER YEAR
       ===================================================== */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* =====================================================
       13. SKILL ICON MAGNETIC MICRO-INTERACTION
       ===================================================== */
    if (!reduced) {
        document.querySelectorAll('.skills-logos .icon-wrapper').forEach(wrapper => {
            const parent = wrapper.closest('a');
            if (!parent) return;

            parent.addEventListener('mousemove', e => {
                const rect = wrapper.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) * 0.18;
                const dy = (e.clientY - cy) * 0.18;
                wrapper.style.transform =
                    `translateY(-12px) scale(1.08) rotate(-3deg) translate(${dx}px, ${dy}px)`;
            });

            parent.addEventListener('mouseleave', () => {
                wrapper.style.transform = '';
            });
        });
    }

    /* =====================================================
       14. ABOUT PHOTO PARALLAX on scroll
       ===================================================== */
    const aboutPhoto = document.querySelector('.about-photo');
    if (aboutPhoto && !reduced) {
        window.addEventListener('scroll', () => {
            const rect = aboutPhoto.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const vh = window.innerHeight / 2;
            const offset = (center - vh) * 0.04;
            aboutPhoto.style.transform = `translateY(${offset}px)`;
        }, { passive: true });
    }

    /* =====================================================
       15. ANIMATED STAT COUNTERS
       ===================================================== */
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length && !reduced) {
        function animateCounter(el) {
            const target = parseInt(el.dataset.count, 10);
            const duration = 1400;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => counterObserver.observe(el));
    }

}
