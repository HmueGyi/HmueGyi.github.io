/* ============================================================
   storytelling.js — Lenis inertia scroll + GSAP ScrollTrigger
   editorial masked typography & subtle depth choreography.
   Degrades cleanly when offline or prefers-reduced-motion is set.
   ============================================================ */

(() => {
    const P = window.Portfolio;

    function splitHeadingWords(el) {
        if (!el || el.dataset.splitDone) return [];
        const rawText = el.textContent.replace(/\s+/g, ' ').trim();
        if (!rawText) return [];

        el.dataset.splitDone = '1';
        el.setAttribute('aria-label', rawText);
        el.textContent = '';

        const words = rawText.split(' ');
        const wordSpans = [];

        words.forEach((word, index) => {
            const mask = document.createElement('span');
            mask.className = 'split-word-mask';
            mask.setAttribute('aria-hidden', 'true');

            const inner = document.createElement('span');
            inner.className = 'split-word';
            inner.textContent = word;

            mask.appendChild(inner);
            el.appendChild(mask);
            wordSpans.push(inner);

            if (index < words.length - 1) {
                el.appendChild(document.createTextNode(' '));
            }
        });

        el.classList.add('gsap-split-active');
        return wordSpans;
    }

    P.modules.initStorytelling = function initStorytelling() {
        if (P.isReducedMotion()) return;

        let lenis = null;
        let tickerCallback = null;
        let fallbackRafId = null;

        if (window.Lenis) {
            lenis = new window.Lenis({
                duration: 1.05,
                smoothWheel: true,
                wheelMultiplier: 0.95
            });
            window.__lenis = lenis;
        }

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;

        if (gsap && ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            if (lenis) {
                lenis.on('scroll', ScrollTrigger.update);
                tickerCallback = time => lenis.raf(time * 1000);
                gsap.ticker.add(tickerCallback);
                gsap.ticker.lagSmoothing(0);
            }

            // 1. Editorial masked word reveal on Hero title
            const heroTitle = document.querySelector('.hero-title');
            const heroWords = splitHeadingWords(heroTitle);
            if (heroWords.length) {
                gsap.set(heroWords, { yPercent: 112, opacity: 0 });
                P.onPageRevealed(() => {
                    if (P.isReducedMotion()) {
                        gsap.set(heroWords, { yPercent: 0, opacity: 1 });
                        return;
                    }
                    gsap.to(heroWords, {
                        yPercent: 0,
                        opacity: 1,
                        duration: 0.75,
                        stagger: 0.065,
                        delay: 0.05,
                        ease: 'power4.out',
                        clearProps: 'transform,opacity'
                    });
                });
            }

            // 2. Editorial masked word reveal on each Section heading
            document.querySelectorAll('main section h3').forEach(heading => {
                const words = splitHeadingWords(heading);
                if (!words.length) return;
                gsap.set(words, { yPercent: 110, opacity: 0 });

                ScrollTrigger.create({
                    trigger: heading,
                    start: 'top 92%',
                    once: true,
                    onEnter: () => {
                        heading.classList.add('in-view');
                        heading.dataset.revealDone = '1';
                        gsap.to(words, {
                            yPercent: 0,
                            opacity: 1,
                            duration: 0.65,
                            stagger: 0.055,
                            ease: 'power4.out',
                            clearProps: 'transform,opacity'
                        });
                    }
                });
            });

            // 3. Subtle scroll depth on Hero visual while scrolling to About
            const heroSection = document.getElementById('home');
            const heroRight = document.querySelector('.hero-right');
            if (heroSection && heroRight) {
                gsap.to(heroRight, {
                    y: -26,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: heroSection,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.6
                    }
                });
            }

            // 4. Bento metric cards spring stagger
            const metricCards = gsap.utils.toArray('.about-metrics .metric-card');
            if (metricCards.length) {
                gsap.set(metricCards, { y: 18, opacity: 0, scale: 0.96 });
                ScrollTrigger.create({
                    trigger: '.about-metrics',
                    start: 'top 90%',
                    once: true,
                    onEnter: () => {
                        gsap.to(metricCards, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.62,
                            stagger: 0.09,
                            ease: 'back.out(1.4)',
                            clearProps: 'transform,opacity'
                        });
                    }
                });
            }

            window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        } else if (lenis) {
            const raf = time => {
                lenis.raf(time);
                fallbackRafId = requestAnimationFrame(raf);
            };
            fallbackRafId = requestAnimationFrame(raf);
        }

        P.onMotionChange(reduced => {
            if (!reduced) return;
            if (tickerCallback && gsap) gsap.ticker.remove(tickerCallback);
            if (fallbackRafId) cancelAnimationFrame(fallbackRafId);
            if (lenis) {
                lenis.destroy?.();
                window.__lenis = null;
            }
            if (ScrollTrigger) {
                ScrollTrigger.getAll().forEach(st => st.kill());
            }
            document.querySelectorAll('.split-word').forEach(w => {
                w.style.opacity = '1';
                w.style.transform = 'none';
            });
            document.querySelectorAll('.about-metrics .metric-card').forEach(c => {
                c.style.opacity = '1';
                c.style.transform = 'none';
            });
        });
    };
})();

