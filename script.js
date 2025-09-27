// Dark/Light mode toggle
const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = document.getElementById('icon');

// Initial theme setup based on saved preference or default to dark mode
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light');
    setIconToSun();
} else {
    document.body.classList.remove('light');
    setIconToMoon();
}

function setIconToSun() {
    icon.innerHTML = `
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            d="M12 4v1M12 19v1M4.22 4.22l.7.7M18.36 18.36l.7.7M1 12h1M19 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" />
    `;
}

function setIconToMoon() {
    icon.innerHTML = `
        <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />
    `;
}

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    if (document.body.classList.contains('light')) {
        setIconToSun();
        localStorage.setItem('theme', 'light');
    } else {
        setIconToMoon();
        localStorage.setItem('theme', 'dark');
    }
});

// Responsive mobile menu toggle
const menuToggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');

    // Toggle button text
    if (menuToggleBtn.textContent === '☰') {
        menuToggleBtn.textContent = '×';
    } else {
        menuToggleBtn.textContent = '☰';
    }
});


// Close menu when clicking a nav link (mobile)
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggleBtn.textContent = '☰';
    });
});

// Typewriter effect
const typewriterElement = document.getElementById('typewriter');
const phrases = [
    "Learning to build smart AI models that solve real-world problems.",
    "Exploring robotics with hands-on projects and sensor technologies.",
    "Designing backend systems to support efficient and reliable applications.",
    "Excited about algorithms, automation, and AI development.",
    "Ready to create innovative AI and robotic solutions step by step."
];
const typingSpeed = 90;
const erasingSpeed = 60;
const delayBetweenPhrases = 1800;
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentPhrase = phrases[phraseIndex];
    if (!isDeleting) {
        // typing
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(type, delayBetweenPhrases);
        } else {
            setTimeout(type, typingSpeed);
        }
    } else {
        // deleting
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
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

document.addEventListener("DOMContentLoaded", () => {
    if (phrases.length) {
        setTimeout(type, delayBetweenPhrases);
    }
});

document.addEventListener('click', (e) => {
    // If click is outside the menu and toggle button
    if (!navMenu.contains(e.target) && !menuToggleBtn.contains(e.target)) {
        navMenu.classList.remove('open');
        menuToggleBtn.textContent = '☰'; // Always reset to hamburger icon
    }
});


// Close menu with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('open');
        menuToggleBtn.textContent = '☰';
    }
});

toggleThemeBtn.addEventListener('click', () => {
    // Close the menu when toggle button is clicked
    navMenu.classList.remove('open');
    menuToggleBtn.textContent = '☰';
    menuToggleBtn.textContent = isOpen ? '×' : '☰';
});


// Optional: contact form submit handling (dummy)
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
});

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
