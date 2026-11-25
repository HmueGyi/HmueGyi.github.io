/* ============================================================
   main.js — boot. Order matters only for the loader/typewriter
   handshake (the typewriter waits for window.__pageRevealed).
   ============================================================ */

initTheme();
initMenu();

initLoader();          // page loader
initReveal();          // IntersectionObserver reveal observers
initTypewriter();
initScrollProgress();
initNav();
initBackground();
initCursorFX();
initHeroParallax();
initAboutParallax();
initCardTilt();
initMagneticSkills();
initContactForm();
initFooterYear();
