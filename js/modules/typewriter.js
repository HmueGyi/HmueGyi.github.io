/* ============================================================
   typewriter.js — rotating hero phrases
   ============================================================ */

(() => {
    const P = window.Portfolio;

    P.modules.initTypewriter = function initTypewriter() {
        const el = P.dom.typewriter;
        if (!el) return;

        const phrases = [
            'Developing intelligent AI agents to assist in everyday tasks.',
            'Hands-on robotics with ROS, sensors, and autonomous navigation.',
            'Building robust AI systems using object detection and LLMs.',
            'Exploring perception, planning, and decision-making for smart machines.'
        ];
        const fallbackText = 'Building smart AI models that solve real problems.';

        if (P.isReducedMotion()) {
            el.textContent = fallbackText;
            return;
        }

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingStarted = false;
        let timerId = null;

        const typingSpeed = 62;
        const erasingSpeed = 32;
        const delayBetween = 1600;

        function schedule(fn, delay) {
            timerId = setTimeout(fn, delay);
        }

        function type() {
            const current = phrases[phraseIndex];
            if (!isDeleting) {
                el.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    isDeleting = true;
                    schedule(type, delayBetween);
                } else {
                    schedule(type, typingSpeed + Math.random() * 35);
                }
            } else {
                el.textContent = current.substring(0, charIndex - 1);
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

        P.onPageRevealed(() => {
            if (typingStarted || P.isReducedMotion()) return;
            typingStarted = true;
            schedule(type, 220);
        });

        P.onMotionChange(reduced => {
            if (!reduced) return;
            clearTimeout(timerId);
            el.textContent = fallbackText;
        });
    };
})();
