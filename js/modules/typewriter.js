/* ============================================================
   typewriter.js — rotating hero phrases
   ============================================================ */

function initTypewriter() {
    if (!typewriterElement) return;

    const phrases = [
        "Developing intelligent AI agents to assist in everyday tasks.",
        "Hands-on robotics with ROS, sensors, and autonomous navigation.",
        "Building robust AI systems using object detection and LLMs.",
        "Exploring perception, planning, and decision-making for smart machines."
    ];

    if (prefersReducedMotion) {
        typewriterElement.textContent = "Building smart AI models that solve real problems.";
        return;
    }

    let phraseIndex = 0, charIndex = 0, isDeleting = false;
    let typingStarted = false;
    let timerId = null;
    const typingSpeed = 70, erasingSpeed = 36, delayBetween = 1600;

    function schedule(fn, delay) {
        timerId = setTimeout(fn, delay);
    }

    function type() {
        const current = phrases[phraseIndex];
        if (!isDeleting) {
            typewriterElement.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                isDeleting = true;
                schedule(type, delayBetween);
            } else {
                schedule(type, typingSpeed + Math.random() * 40);
            }
        } else {
            typewriterElement.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                schedule(type, typingSpeed);
            } else {
                schedule(type, erasingSpeed);
            }
        }
    }

    // Start only once, and only after the loader has been dismissed
    function startTypewriter() {
        if (typingStarted) return;
        typingStarted = true;
        type();
    }

    (function waitForReveal() {
        if (window.__pageRevealed) schedule(startTypewriter, 300);
        else schedule(waitForReveal, 100);
    })();

    onMotionChange(reduced => {
        if (!reduced) return;
        clearTimeout(timerId);
        typewriterElement.textContent = "Building smart AI models that solve real problems.";
    });
}
