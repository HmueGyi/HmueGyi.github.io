import { 
    typewriterElement, 
    prefersReducedMotion, 
    backToTop, 
    contactForm, 
    tiltCards, 
    revealElements 
} from './elements.js';

export function initAnimations() {
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

    // ================== Back to Top ==================
    window.addEventListener('scroll', () => {
        if (backToTop) {
            if (window.scrollY > 400) backToTop.classList.add('show');
            else backToTop.classList.remove('show');
        }
    });
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ================== Contact Form ==================
    contactForm?.addEventListener('submit', e => {
        e.preventDefault();
        alert('Thank you — I will get back to you soon.');
        contactForm.reset();
    });

    // ================== Project Card Tilt ==================
    let lastMove = 0;
    tiltCards.forEach(card => {
        if (prefersReducedMotion) return;
        const inner = card.querySelector('.project-inner') || card;

        card.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastMove < 12) return;
            lastMove = now;

            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rotY = (px - 0.5) * 20;
            const rotX = (0.5 - py) * 12;
            const translateZ = 18;

            card.style.transform = `perspective(900px) translateZ(0) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
            inner.style.transform = `translateZ(${translateZ}px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            inner.style.transform = '';
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
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ================== Robot Animations ==================
    const pupils = document.querySelectorAll('.pupil');
    function blink() {
        pupils.forEach(p => p.setAttribute('r', 0));
        setTimeout(() => {
            pupils.forEach(p => p.setAttribute('r', 8));
        }, 200);
    }
    setInterval(blink, Math.random() * 1000 + 3000);

    const bubble = document.querySelector('.speech-bubble');
    setTimeout(() => {
        bubble?.classList.add('show');
    }, 1000);

    // ================== Page Load Transition ==================
    window.addEventListener('load', () => {
        const frame = document.getElementById('transition-frame');
        setTimeout(() => {
            frame?.classList.add('hide');
        }, 300);
    });

    // ================== Project Card Clickable ==================
    document.querySelectorAll('.project-card').forEach(card => {
        const link = card.querySelector('.project-link');
        if (!link) return;

        card.addEventListener('click', () => {
            window.open(link.href, '_blank');
        });

        card.style.cursor = 'pointer';
    });
}
