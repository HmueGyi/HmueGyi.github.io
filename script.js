// ================== Elements ==================
const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = document.getElementById('icon');
const menuToggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const typewriterElement = document.getElementById('typewriter');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const tiltCards = document.querySelectorAll('[data-tilt]');
const revealElements = document.querySelectorAll('section, .project-card, .about-photo, .skills-logos *, .skills-logos a');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ================== Dark/Light Mode ==================
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let savedTheme = localStorage.getItem('theme');

// If no saved theme, use system preference
if (!savedTheme) {
    savedTheme = systemPrefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', savedTheme);
}

// Apply theme
if (savedTheme === 'light') {
    document.body.classList.add('light');
    setIconToSun();
} else {
    document.body.classList.remove('light');
    setIconToMoon();
}

function setIconToSun() {
    if (!icon) return;
    icon.innerHTML = `
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M12 4v1M12 19v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M19 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
    `;
}

function setIconToMoon() {
    if (!icon) return;
    icon.innerHTML = `
        <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />
    `;
}

// Toggle button
if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light');
        if (document.body.classList.contains('light')) {
            setIconToSun();
            localStorage.setItem('theme', 'light');
        } else {
            setIconToMoon();
            localStorage.setItem('theme', 'dark');
        }

        // Close mobile nav on toggle
        navMenu?.classList.remove('open');
        if (menuToggleBtn) menuToggleBtn.textContent = '☰';
    });
}

// Optional: react to system preference changes if user hasn't set manually
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.body.classList.remove('light');
            setIconToMoon();
        } else {
            document.body.classList.add('light');
            setIconToSun();
        }
    }
});

// ================== Mobile Menu ==================
if (menuToggleBtn && navMenu) {
    menuToggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        menuToggleBtn.textContent = menuToggleBtn.textContent.trim() === '☰' ? '×' : '☰';
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            menuToggleBtn.textContent = '☰';
        });
    });

    document.addEventListener('click', e => {
        if (!navMenu.contains(e.target) && !menuToggleBtn.contains(e.target)) {
            navMenu.classList.remove('open');
            menuToggleBtn.textContent = '☰';
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('open');
            menuToggleBtn.textContent = '☰';
        }
    });
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
