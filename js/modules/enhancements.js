/* ============================================================
   enhancements.js — Three.js 3D bg, GSAP + Lenis, Filters,
   Case Study Modal, CV Modal, Copy Email & Command Palette
   ============================================================ */

(() => {
    const P = window.Portfolio;

    const CASE_STUDIES = {
        'kilo-bot': {
            title: 'ROS 2 Offline Voice Assistant (Kilo Bot)',
            summary: 'A fully local, interruptible voice interaction loop built on ROS 2 without any cloud API dependencies.',
            pipeline: 'Microphone → Vosk STT + Silero/Energy VAD → ROS 2 Topic → Ollama (Local Llama) → Piper TTS → Speaker (with barge-in interrupt).',
            decisions: 'Separated audio capture, LLM inference, and speech synthesis into asynchronous ROS 2 nodes so Voice Activity Detection can immediately cancel TTS playback mid-sentence when the user speaks.',
            tags: ['ROS 2', 'Ollama', 'Vosk', 'Piper TTS', 'VAD', 'Python'],
            repo: 'https://github.com/HmueGyi/LLM_ROS2'
        },
        'facial-emotion': {
            title: 'Facial Emotion Detection',
            summary: 'Real-time webcam emotion classification combining MediaPipe face detection with an EfficientNet-V2-S PyTorch classifier.',
            pipeline: 'Webcam Frame → MediaPipe Face Detector → Aligned Face Crop → EfficientNet-V2-S (PyTorch) → Live Emotion Overlay.',
            decisions: 'Paired lightweight MediaPipe landmarks with EfficientNet-V2-S to keep per-frame latency low on consumer laptops while keeping the entire training and evaluation pipeline reproducible in a single notebook.',
            tags: ['MediaPipe', 'PyTorch', 'EfficientNet-V2-S', 'OpenCV', 'Python'],
            repo: 'https://github.com/HmueGyi/6_facial_detection'
        },
        'four-wheel-ros2': {
            title: 'Four-Wheel Robot Simulation',
            summary: 'Modular ROS 2 four-wheel mobile robot description and Gazebo simulation stack.',
            pipeline: 'Xacro / URDF Description → Gazebo Harmonic/Classic Plugins → Differential Drive / cmd_vel → RViz2 Visualization.',
            decisions: 'Split robot_description and gazebo simulation into separate ROS 2 packages so downstream navigation or SLAM stacks can reuse the URDF cleanly without simulation dependencies.',
            tags: ['ROS 2', 'Gazebo', 'URDF / Xacro', 'Simulation'],
            repo: 'https://github.com/HmueGyi/four_wheels_car_ros2'
        },
        'vlm-captioning': {
            title: 'Local VLM Image Captioning',
            summary: 'Browser-based exploration tool for local Vision-Language Models across three inference backends.',
            pipeline: 'Image / Live Camera → Web UI → Unified Runtime Adapter (Transformers | ONNX Runtime | llama.cpp) → Streaming Caption.',
            decisions: 'Abstracted model loading behind a common runtime interface so accuracy, VRAM usage, and tokens-per-second can be benchmarked side-by-side without changing UI code.',
            tags: ['VLM', 'ONNX Runtime', 'llama.cpp', 'Transformers', 'Web UI'],
            repo: 'https://github.com/HmueGyi/VLM-image-captioning'
        },
        'yolo-onnx': {
            title: 'YOLO Object Detection with ONNX',
            summary: 'Portable YOLOv8 object detector supporting images, video files, and live webcam streams.',
            pipeline: 'Media Input → Pre-processing (Letterbox/Normalize) → YOLOv8 (ONNX Runtime / PyTorch) → NMS → Annotated Output.',
            decisions: 'Standardized pre/post-processing around ONNX Runtime execution providers so the exact same pipeline switches between laptop CPU and NVIDIA CUDA GPU via configuration.',
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

    function initThreeBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas || !window.THREE || P.isReducedMotion()) return false;

        try {
            const THREE = window.THREE;
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.z = 18;

            const count = window.innerWidth < 768 ? 140 : 280;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 34;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const getColor = () => (P.isLightTheme() ? 0x0284c7 : 0x38bdf8);
            const mat = new THREE.PointsMaterial({
                color: getColor(),
                size: 0.12,
                transparent: true,
                opacity: P.isLightTheme() ? 0.45 : 0.65
            });
            const points = new THREE.Points(geo, mat);
            scene.add(points);

            // Subtle rotating robotics/neural wireframe core
            const coreGeo = new THREE.IcosahedronGeometry(4.2, 1);
            const coreMat = new THREE.MeshBasicMaterial({
                color: P.isLightTheme() ? 0x4f46e5 : 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: P.isLightTheme() ? 0.12 : 0.18
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.position.set(5.5, 0.5, -4);
            scene.add(core);

            P.onThemeChange(() => {
                mat.color.setHex(getColor());
                mat.opacity = P.isLightTheme() ? 0.45 : 0.65;
                coreMat.color.setHex(P.isLightTheme() ? 0x4f46e5 : 0x6366f1);
                coreMat.opacity = P.isLightTheme() ? 0.12 : 0.18;
            });

            let mouseX = 0;
            let mouseY = 0;
            window.addEventListener('pointermove', e => {
                mouseX = (e.clientX / window.innerWidth - 0.5) * 1.4;
                mouseY = (e.clientY / window.innerHeight - 0.5) * 1.0;
            }, { passive: true });

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, { passive: true });

            let rafId = null;
            function animate() {
                if (!document.hidden) {
                    points.rotation.y += 0.0008;
                    points.rotation.x += 0.0003;
                    core.rotation.y -= 0.0022;
                    core.rotation.x += 0.0011;
                    camera.position.x += (mouseX - camera.position.x) * 0.03;
                    camera.position.y += (-mouseY - camera.position.y) * 0.03;
                    camera.lookAt(scene.position);
                    renderer.render(scene, camera);
                }
                rafId = requestAnimationFrame(animate);
            }
            animate();
            P.onMotionChange(reduced => {
                if (reduced && rafId) cancelAnimationFrame(rafId);
            });
            return true;
        } catch {
            return false;
        }
    }

    function initLenisAndGSAP() {
        if (P.isReducedMotion()) return;

        let lenis = null;
        if (window.Lenis) {
            lenis = new window.Lenis({
                duration: 1.05,
                smoothWheel: true,
                wheelMultiplier: 0.95
            });
            window.__lenis = lenis;
        }

        if (window.gsap) {
            const gsap = window.gsap;
            if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

            if (lenis) {
                if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
                gsap.ticker.add(time => lenis.raf(time * 1000));
                gsap.ticker.lagSmoothing(0);
            } else {
                // fallback loop if gsap didn't bind
            }

            // Subtle GSAP entrance for hero badge & metrics
            gsap.from('.availability-badge', {
                y: -12,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                clearProps: 'transform,opacity'
            });
        } else if (lenis) {
            const raf = time => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }

    function initFilters() {
        document.querySelectorAll('.filter-pills').forEach(group => {
            const type = group.dataset.filterGroup;
            const items = type === 'skills'
                ? document.querySelectorAll('.skills-logos a[data-category]')
                : document.querySelectorAll('.projects-grid .project-card[data-category]');

            group.querySelectorAll('.filter-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.dataset.filter;
                    group.querySelectorAll('.filter-pill').forEach(b => {
                        const active = b === btn;
                        b.classList.toggle('active', active);
                        b.setAttribute('aria-pressed', active ? 'true' : 'false');
                    });

                    items.forEach(item => {
                        const cats = (item.dataset.category || '').split(/\s+/);
                        const match = filter === 'all' || cats.includes(filter);
                        item.classList.toggle('is-filtered-out', !match);
                        if (match) {
                            item.classList.add('in-view');
                        }
                    });
                });
            });
        });
    }

    function initModals() {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        const closeAll = () => {
            backdrops.forEach(m => {
                m.classList.remove('open');
                m.setAttribute('aria-hidden', 'true');
            });
            document.body.style.overflow = '';
            window.__lenis?.start?.();
        };

        const openModal = modal => {
            if (!modal) return;
            closeAll();
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            window.__lenis?.stop?.();
        };

        backdrops.forEach(m => {
            m.addEventListener('click', e => {
                if (e.target === m) closeAll();
            });
            m.querySelectorAll('[data-close-modal]').forEach(btn => {
                btn.addEventListener('click', closeAll);
            });
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeAll();
        });

        // Case Study Modal
        const caseModal = document.getElementById('caseStudyModal');
        document.querySelectorAll('.open-case-study').forEach(btn => {
            btn.addEventListener('click', () => {
                const data = CASE_STUDIES[btn.dataset.projectId];
                if (!data || !caseModal) return;
                document.getElementById('caseStudyTitle').textContent = data.title;
                document.getElementById('caseStudySummary').textContent = data.summary;
                document.getElementById('caseStudyPipeline').textContent = data.pipeline;
                document.getElementById('caseStudyDecisions').textContent = data.decisions;
                document.getElementById('caseStudyRepoLink').href = data.repo;

                const tagsEl = document.getElementById('caseStudyTags');
                tagsEl.innerHTML = '';
                data.tags.forEach(t => {
                    const span = document.createElement('span');
                    span.textContent = t;
                    tagsEl.appendChild(span);
                });
                openModal(caseModal);
            });
        });

        // CV Modal
        const cvModal = document.getElementById('cvModal');
        document.getElementById('openCvBtn')?.addEventListener('click', () => openModal(cvModal));
        document.getElementById('printCvBtn')?.addEventListener('click', () => {
            closeAll();
            window.print();
        });

        // Command Palette (Ctrl+K / Cmd+K)
        const cmdkModal = document.getElementById('cmdkModal');
        const cmdkInput = document.getElementById('cmdkInput');
        const cmdkList = document.getElementById('cmdkList');
        const commands = [
            { label: 'Jump to Home', hint: '#home', action: () => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' }) },
            { label: 'Jump to About Me', hint: '#about', action: () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }) },
            { label: 'Jump to Skills', hint: '#skills', action: () => document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }) },
            { label: 'Jump to Projects', hint: '#projects', action: () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) },
            { label: 'Jump to Contact', hint: '#contact', action: () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) },
            { label: 'View CV / Resume', hint: 'Modal', action: () => openModal(cvModal) },
            { label: 'Toggle Light / Dark Theme', hint: 'Theme', action: () => document.getElementById('toggleTheme')?.click() },
            { label: 'Copy Email (hmuesett2002@gmail.com)', hint: 'Clipboard', action: () => copyEmail('hmuesett2002@gmail.com') },
            { label: 'Open GitHub Profile', hint: 'External', action: () => window.open('https://github.com/HmueGyi', '_blank', 'noopener') }
        ];

        function renderCommands(query = '') {
            if (!cmdkList) return;
            const q = query.trim().toLowerCase();
            cmdkList.innerHTML = '';
            commands
                .filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q))
                .forEach(c => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'cmdk-item';
                    btn.innerHTML = `<span>${c.label}</span><span class="cmdk-hint">${c.hint}</span>`;
                    btn.addEventListener('click', () => {
                        closeAll();
                        c.action();
                    });
                    cmdkList.appendChild(btn);
                });
        }

        const openCmdk = () => {
            renderCommands('');
            openModal(cmdkModal);
            setTimeout(() => cmdkInput?.focus(), 40);
        };

        document.getElementById('cmdKBtn')?.addEventListener('click', openCmdk);
        cmdkInput?.addEventListener('input', e => renderCommands(e.target.value));
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (cmdkModal?.classList.contains('open')) closeAll();
                else openCmdk();
            }
        });
    }

    function copyEmail(email) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard!'))
                .catch(() => showToast(email));
        } else {
            showToast(email);
        }
    }

    function initCopyEmail() {
        const btn = document.getElementById('copyEmailBtn');
        btn?.addEventListener('click', () => copyEmail(btn.dataset.email || 'hmuesett2002@gmail.com'));
    }

    P.modules.initThreeBackground = initThreeBackground;
    P.modules.initEnhancements = function initEnhancements() {
        initLenisAndGSAP();
        initFilters();
        initModals();
        initCopyEmail();
    };
})();
