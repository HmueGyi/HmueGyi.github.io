/* ================== Cached DOM References ================== */
const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = document.getElementById('icon');
const menuToggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const typewriterElement = document.getElementById('typewriter');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const tiltCards = document.querySelectorAll('[data-tilt]');
const robotMedia = document.getElementById('robot-media');

/* ================== Motion preference (live) ==================
   Read once for the initial render, but also kept in sync: a visitor who
   flips "reduce motion" in their OS should not have to reload the page.
   Modules with running rAF loops register a teardown via onMotionChange(). */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;
const motionListeners = [];

function onMotionChange(fn) {
    motionListeners.push(fn);
}

motionQuery.addEventListener('change', e => {
    prefersReducedMotion = e.matches;
    motionListeners.forEach(fn => fn(prefersReducedMotion));
});
