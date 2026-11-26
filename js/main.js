/* ============================================================
   main.js — boot sequence
   ============================================================ */

(() => {
    const m = window.Portfolio.modules;

    m.initTheme();
    m.initMenu();
    m.initLoader();
    m.initReveal();
    m.initTypewriter();
    m.initScrollProgress();
    m.initNav();
    m.initBackground();
    m.initCursorFX();
    m.initHeroParallax();
    m.initAboutParallax();
    m.initCardTilt();
    m.initMagneticSkills();
    m.initMagneticButtons();
    m.initContactForm();
    m.initFooterYear();
})();
