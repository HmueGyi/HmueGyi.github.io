function initAnimations() {
    // ================== Typewriter ==================
    if (!prefersReducedMotion && typewriterElement) {
        const phrases = [
            "Architecting Autonomous Systems.",
            "Expanding Machine Perception.",
            "Building the Ethics of AI.",
            "Bridging Physics and Intelligence."
        ];
        let phraseIndex = 0, charIndex = 0, isDeleting = false;
        const typingSpeed = 60, erasingSpeed = 30, delayBetween = 2000;

        function type() {
            const current = phrases[phraseIndex];
            if (!isDeleting) {
                typewriterElement.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    isDeleting = true;
                    setTimeout(type, delayBetween);
                } else {
                    setTimeout(type, typingSpeed + Math.random() * 30);
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
        setTimeout(type, 1000);
    } else if (typewriterElement) {
        typewriterElement.textContent = "Robotics & AI Architect";
    }

    // ================== Back to Top ==================
    window.addEventListener('scroll', () => {
        if (backToTop) {
            if (window.scrollY > 500) backToTop.classList.add('show');
            else backToTop.classList.remove('show');
        }
    });
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ================== Contact Form ==================
    contactForm?.addEventListener('submit', e => {
        e.preventDefault();
        alert('Message received. I will reach out to you shortly.');
        contactForm.reset();
    });

    // ================== Project Card Tilt ==================
    let lastMove = 0;
    tiltCards.forEach(card => {
        if (prefersReducedMotion) return;
        const inner = card.querySelector('.project-inner') || card;

        card.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastMove < 15) return;
            lastMove = now;

            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rotY = (px - 0.5) * 15;
            const rotX = (0.5 - py) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ================== Reveal on Scroll ==================
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
}
