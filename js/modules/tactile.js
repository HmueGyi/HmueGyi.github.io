/* ============================================================
   tactile.js — Sliding-pill category filters, Card-to-Modal
   View Transitions morph, Command Palette (Ctrl/Cmd+K) & Toast
   ============================================================ */

(() => {
    const P = window.Portfolio;

    const CASE_STUDIES = {
        'kilo-bot': {
            domain: 'Robotics & Edge Voice AI',
            title: 'ROS 2 Offline Voice Assistant (Kilo Bot)',
            summary: 'A fully local, interruptible voice interaction loop running on ROS 2 without any cloud API dependencies.',
            pipelineSteps: ['Microphone', 'Vosk STT + VAD', 'ROS 2 Topic', 'Ollama (Llama)', 'Piper TTS', 'Barge-In Interrupt'],
            decisions: 'Separated audio capture, LLM inference, and speech synthesis into asynchronous ROS 2 nodes so Voice Activity Detection cancels TTS playback mid-sentence the moment the user speaks.',
            tags: ['ROS 2', 'Ollama', 'Vosk', 'Piper TTS', 'VAD', 'Python'],
            repo: 'https://github.com/HmueGyi/LLM_ROS2'
        },
        'facial-emotion': {
            domain: 'Real-Time Computer Vision',
            title: 'Facial Emotion Detection',
            summary: 'Live webcam emotion classification combining MediaPipe face detection with an EfficientNet-V2-S PyTorch classifier.',
            pipelineSteps: ['Webcam Frame', 'MediaPipe Face Detector', 'Aligned Crop', 'EfficientNet-V2-S (PyTorch)', 'Live Overlay'],
            decisions: 'Paired lightweight MediaPipe landmarks with EfficientNet-V2-S to keep per-frame latency low on consumer laptops while keeping training and evaluation reproducible in one notebook.',
            tags: ['MediaPipe', 'PyTorch', 'EfficientNet-V2-S', 'OpenCV', 'Python'],
            repo: 'https://github.com/HmueGyi/6_facial_detection'
        },
        'four-wheel-ros2': {
            domain: 'Robotics Simulation',
            title: 'Four-Wheel Robot Simulation',
            summary: 'Modular ROS 2 four-wheel mobile robot description and Gazebo simulation stack built for reuse.',
            pipelineSteps: ['URDF / Xacro', 'robot_state_publisher', 'Gazebo Plugins', 'cmd_vel Diff Drive', 'RViz2'],
            decisions: 'Split robot_description and Gazebo simulation into separate ROS 2 packages so downstream SLAM or Nav2 stacks can reuse the URDF cleanly without simulator dependencies.',
            tags: ['ROS 2', 'Gazebo', 'URDF / Xacro', 'Simulation'],
            repo: 'https://github.com/HmueGyi/four_wheels_car_ros2'
        },
        'vlm-captioning': {
            domain: 'Vision-Language Runtime',
            title: 'Local VLM Image Captioning',
            summary: 'Browser-based exploration interface for benchmarking local Vision-Language Models across three inference backends.',
            pipelineSteps: ['Image / Camera', 'Web UI', 'Runtime Adapter', 'Transformers / ONNX / llama.cpp', 'Caption Stream'],
            decisions: 'Abstracted model loading behind a unified runtime adapter so caption quality, VRAM footprint, and tokens-per-second can be benchmarked side-by-side without modifying UI logic.',
            tags: ['VLM', 'ONNX Runtime', 'llama.cpp', 'Transformers', 'Web UI'],
            repo: 'https://github.com/HmueGyi/VLM-image-captioning'
        },
        'yolo-onnx': {
            domain: 'Portable Edge Inference',
            title: 'YOLO Object Detection with ONNX',
            summary: 'Portable YOLOv8 object detector supporting images, video files, and live webcam feeds on CPU or CUDA.',
            pipelineSteps: ['Media Input', 'Letterbox Preprocess', 'YOLOv8 (ONNX / PyTorch)', 'NMS Filter', 'Annotated Frame'],
            decisions: 'Standardized pre/post-processing around ONNX Runtime execution providers so the exact same pipeline switches cleanly between laptop CPU and NVIDIA CUDA GPU via configuration.',
            tags: ['YOLOv8', 'ONNX Runtime', 'OpenCV', 'CUDA', 'PyTorch'],
            repo: 'https://github.com/HmueGyi/ONNX_Object_Detection'
        }
    };

    function showToast(message) {
        const toast = document.getElementById('portfolio-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => toast.classList.remove('visible'), 2400);
    }

    function scrollToSection(selector) {
        const target = document.querySelector(selector);
        if (!target) return;
        if (window.__lenis && !P.isReducedMotion()) {
            window.__lenis.scrollTo(target, { offset: -92 });
        } else {
            target.scrollIntoView({ behavior: P.isReducedMotion() ? 'auto' : 'smooth' });
        }
        history.replaceState(null, '', selector);
    }

    function copyText(value, feedback) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(value)
                .then(() => showToast(feedback))
                .catch(() => showToast(value));
        } else {
            showToast(value);
        }
    }

    /* ------------------ Sliding-Pill Category Filters ------------------ */
    function initFilters() {
        const groups = document.querySelectorAll('.filter-pills');
        if (!groups.length) return;

        groups.forEach(group => {
            const type = group.dataset.filterGroup;
            const buttons = Array.from(group.querySelectorAll('.filter-pill'));
            const items = type === 'skills'
                ? Array.from(document.querySelectorAll('.skills-logos a[data-category]'))
                : Array.from(document.querySelectorAll('.projects-grid .project-card[data-category]'));

            if (!buttons.length || !items.length) return;

            const indicator = document.createElement('span');
            indicator.className = 'filter-pill-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            group.prepend(indicator);

            function syncIndicator() {
                const activeBtn = group.querySelector('.filter-pill.active');
                if (!activeBtn || P.isReducedMotion()) {
                    indicator.classList.remove('visible');
                    group.classList.add('no-indicator');
                    return;
                }

                // If pills wrap into multiple rows on tiny screens, use crisp fallback fill
                const multiRow = buttons.some(b => Math.abs(b.offsetTop - buttons[0].offsetTop) > 6);
                if (multiRow) {
                    indicator.classList.remove('visible');
                    group.classList.add('no-indicator');
                    return;
                }

                group.classList.remove('no-indicator');
                const scaleX = activeBtn.offsetWidth / 100;
                indicator.style.height = `${activeBtn.offsetHeight}px`;
                indicator.style.transform = `translate3d(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px, 0) scaleX(${scaleX})`;
                indicator.classList.add('visible');
            }

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.dataset.filter;
                    buttons.forEach(b => {
                        const isActive = b === btn;
                        b.classList.toggle('active', isActive);
                        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                    });

                    syncIndicator();

                    const matchedItems = [];
                    items.forEach(item => {
                        const cats = (item.dataset.category || '').split(/\s+/);
                        const match = filter === 'all' || cats.includes(filter);
                        item.classList.toggle('is-filtered-out', !match);
                        if (match) {
                            item.classList.add('in-view');
                            item.dataset.revealDone = '1';
                            item.style.opacity = '1';
                            item.style.filter = 'none';
                            matchedItems.push(item);
                        }
                    });

                    if (window.gsap && matchedItems.length && !P.isReducedMotion()) {
                        window.gsap.fromTo(
                            matchedItems,
                            { opacity: 0, y: 12, scale: 0.96 },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.42,
                                stagger: 0.025,
                                ease: 'back.out(1.25)',
                                clearProps: 'transform,opacity'
                            }
                        );
                    }

                    window.ScrollTrigger?.refresh?.();
                });
            });

            window.addEventListener('resize', syncIndicator, { passive: true });
            P.onPageRevealed(() => requestAnimationFrame(syncIndicator));
            requestAnimationFrame(syncIndicator);
        });
    }

    /* ------------------ Modals + View Transitions Card Morph ------------------ */
    function initModals() {
        const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
        const caseModal = document.getElementById('caseStudyModal');
        const caseModalCard = caseModal?.querySelector('.modal-card');
        const cmdkModal = document.getElementById('cmdkModal');
        const cmdkInput = document.getElementById('cmdkInput');
        const cmdkList = document.getElementById('cmdkList');

        let activeModal = null;
        let lastFocused = null;
        let activeSourceCard = null;
        let selectedCmdIndex = 0;
        let filteredCommands = [];

        function setBodyModalLock(locked) {
            document.body.style.overflow = locked ? 'hidden' : '';
            if (locked) window.__lenis?.stop?.();
            else window.__lenis?.start?.();
        }

        function finishClose(restoreFocus = true) {
            backdrops.forEach(m => {
                m.classList.remove('open');
                m.setAttribute('aria-hidden', 'true');
            });
            activeModal = null;
            setBodyModalLock(false);
            if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
            lastFocused = null;
        }

        function closeAll(restoreFocus = true) {
            if (!activeModal) return;

            const canMorphBack =
                activeModal === caseModal &&
                activeSourceCard &&
                caseModalCard &&
                document.startViewTransition &&
                !P.isReducedMotion() &&
                document.body.contains(activeSourceCard);

            if (!canMorphBack) {
                if (caseModalCard) caseModalCard.style.viewTransitionName = '';
                if (activeSourceCard) activeSourceCard.style.viewTransitionName = '';
                activeSourceCard = null;
                finishClose(restoreFocus);
                return;
            }

            const cardRef = activeSourceCard;
            activeSourceCard = null;
            caseModalCard.style.viewTransitionName = 'active-project-card';

            const vt = document.startViewTransition(() => {
                caseModalCard.style.viewTransitionName = '';
                cardRef.style.viewTransitionName = 'active-project-card';
                finishClose(restoreFocus);
            });

            vt.finished.finally(() => {
                cardRef.style.viewTransitionName = '';
                caseModalCard.style.viewTransitionName = '';
            });
        }

        function openPlainModal(modal, opener = document.activeElement) {
            if (!modal) return;
            if (activeModal) finishClose(false);
            lastFocused = opener;
            activeModal = modal;
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            setBodyModalLock(true);
        }

        function populateCaseStudy(projectId) {
            const data = CASE_STUDIES[projectId];
            if (!data || !caseModal) return false;

            document.getElementById('caseStudyDomain').textContent = data.domain;
            document.getElementById('caseStudyTitle').textContent = data.title;
            document.getElementById('caseStudySummary').textContent = data.summary;
            document.getElementById('caseStudyDecisions').textContent = data.decisions;
            document.getElementById('caseStudyRepoLink').href = data.repo;

            const pipelineEl = document.getElementById('caseStudyPipeline');
            pipelineEl.innerHTML = '';
            data.pipelineSteps.forEach((step, idx) => {
                const node = document.createElement('span');
                node.className = 'pipeline-node';
                node.textContent = step;
                pipelineEl.appendChild(node);
                if (idx < data.pipelineSteps.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.className = 'pipeline-arrow';
                    arrow.textContent = '→';
                    arrow.setAttribute('aria-hidden', 'true');
                    pipelineEl.appendChild(arrow);
                }
            });

            const tagsEl = document.getElementById('caseStudyTags');
            tagsEl.innerHTML = '';
            data.tags.forEach(tag => {
                const span = document.createElement('span');
                span.textContent = tag;
                tagsEl.appendChild(span);
            });

            return true;
        }

        function openCaseStudy(projectId, sourceCard = null, opener = document.activeElement) {
            if (!populateCaseStudy(projectId)) return;
            if (activeModal) finishClose(false);

            lastFocused = opener;
            activeSourceCard = sourceCard;

            const canMorph =
                sourceCard &&
                caseModalCard &&
                document.startViewTransition &&
                !P.isReducedMotion();

            if (!canMorph) {
                openPlainModal(caseModal, opener);
                caseModal.querySelector('.modal-close')?.focus();
                return;
            }

            sourceCard.style.viewTransitionName = 'active-project-card';
            const vt = document.startViewTransition(() => {
                sourceCard.style.viewTransitionName = '';
                caseModalCard.style.viewTransitionName = 'active-project-card';
                openPlainModal(caseModal, opener);
            });

            vt.finished.finally(() => {
                sourceCard.style.viewTransitionName = '';
                caseModalCard.style.viewTransitionName = '';
                caseModal.querySelector('.modal-close')?.focus();
            });
        }

        document.querySelectorAll('.open-case-study').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.project-card');
                openCaseStudy(btn.dataset.projectId, card, btn);
            });
        });

        backdrops.forEach(m => {
            m.addEventListener('click', e => {
                if (e.target === m) closeAll();
            });
            m.querySelectorAll('[data-close-modal]').forEach(btn => {
                btn.addEventListener('click', () => closeAll());
            });
        });

        /* ------------------ Command Palette (Ctrl/Cmd + K) ------------------ */
        const commands = [
            { label: 'Jump to Home', hint: '#home', action: () => scrollToSection('#home') },
            { label: 'Jump to About Me', hint: '#about', action: () => scrollToSection('#about') },
            { label: 'Jump to Skills', hint: '#skills', action: () => scrollToSection('#skills') },
            { label: 'Jump to Projects', hint: '#projects', action: () => scrollToSection('#projects') },
            { label: 'Jump to Contact', hint: '#contact', action: () => scrollToSection('#contact') },
            { label: 'Architecture: ROS 2 Offline Voice Assistant', hint: 'Case Study', action: () => openCaseStudy('kilo-bot', document.querySelector('[data-project-id="kilo-bot"]')) },
            { label: 'Architecture: Facial Emotion Detection', hint: 'Case Study', action: () => openCaseStudy('facial-emotion', document.querySelector('[data-project-id="facial-emotion"]')) },
            { label: 'Architecture: Four-Wheel Robot Simulation', hint: 'Case Study', action: () => openCaseStudy('four-wheel-ros2', document.querySelector('[data-project-id="four-wheel-ros2"]')) },
            { label: 'Architecture: Local VLM Image Captioning', hint: 'Case Study', action: () => openCaseStudy('vlm-captioning', document.querySelector('[data-project-id="vlm-captioning"]')) },
            { label: 'Architecture: YOLO Object Detection (ONNX)', hint: 'Case Study', action: () => openCaseStudy('yolo-onnx', document.querySelector('[data-project-id="yolo-onnx"]')) },
            { label: 'Toggle Light / Dark Theme', hint: 'Theme', action: () => document.getElementById('toggleTheme')?.click() },
            { label: 'Copy Email Address', hint: 'hmuesett2002@gmail.com', action: () => copyText('hmuesett2002@gmail.com', 'Email copied to clipboard!') },
            { label: 'Open GitHub Profile', hint: 'External', action: () => window.open('https://github.com/HmueGyi', '_blank', 'noopener,noreferrer') }
        ];

        function highlightSelectedCmd() {
            if (!cmdkList) return;
            const rows = Array.from(cmdkList.querySelectorAll('.cmdk-item'));
            rows.forEach((row, idx) => {
                const selected = idx === selectedCmdIndex;
                row.classList.toggle('is-selected', selected);
                row.setAttribute('aria-selected', selected ? 'true' : 'false');
                if (selected) row.scrollIntoView({ block: 'nearest' });
            });
        }

        function runCommand(cmd) {
            if (!cmd) return;
            finishClose(false);
            cmd.action();
        }

        function renderCommands(query = '') {
            if (!cmdkList) return;
            const q = query.trim().toLowerCase();
            filteredCommands = commands.filter(
                c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)
            );
            selectedCmdIndex = 0;
            cmdkList.innerHTML = '';

            if (!filteredCommands.length) {
                const empty = document.createElement('div');
                empty.className = 'cmdk-empty';
                empty.textContent = `No commands matching "${query.trim()}"`;
                cmdkList.appendChild(empty);
                return;
            }

            filteredCommands.forEach((cmd, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cmdk-item' + (idx === 0 ? ' is-selected' : '');
                btn.setAttribute('role', 'option');
                btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

                const labelSpan = document.createElement('span');
                labelSpan.textContent = cmd.label;
                const hintSpan = document.createElement('span');
                hintSpan.className = 'cmdk-hint';
                hintSpan.textContent = cmd.hint;

                btn.append(labelSpan, hintSpan);
                btn.addEventListener('mouseenter', () => {
                    selectedCmdIndex = idx;
                    highlightSelectedCmd();
                });
                btn.addEventListener('click', () => runCommand(cmd));
                cmdkList.appendChild(btn);
            });
        }

        function openCmdk(opener = document.activeElement) {
            if (!cmdkModal) return;
            if (cmdkInput) cmdkInput.value = '';
            renderCommands('');
            openPlainModal(cmdkModal, opener);
            setTimeout(() => cmdkInput?.focus(), 35);
        }

        const cmdKBtn = document.getElementById('cmdKBtn');
        cmdKBtn?.addEventListener('click', () => openCmdk(cmdKBtn));

        cmdkInput?.addEventListener('input', e => renderCommands(e.target.value));

        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (activeModal === cmdkModal) closeAll();
                else openCmdk();
                return;
            }

            if (!activeModal) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeAll();
                return;
            }

            if (activeModal === cmdkModal && filteredCommands.length) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length;
                    highlightSelectedCmd();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedCmdIndex = (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
                    highlightSelectedCmd();
                    return;
                }
                if (e.key === 'Enter' && document.activeElement === cmdkInput) {
                    e.preventDefault();
                    runCommand(filteredCommands[selectedCmdIndex]);
                    return;
                }
            }

            // Focus trap inside active modal
            if (e.key === 'Tab') {
                const focusables = Array.from(
                    activeModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
                ).filter(el => el.offsetParent !== null);
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    P.modules.initTactileUI = function initTactileUI() {
        initFilters();
        initModals();
    };
})();
