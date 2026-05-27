document.addEventListener("DOMContentLoaded", () => {
    // 1. Loader Logic
    const loader = document.getElementById("loader");
    const loaderLogo = document.getElementById("loader-logo");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const mainContent = document.getElementById("main-content");

    // Animação de entrada do logo
    gsap.to(loaderLogo, {
        y: "0%",
        duration: 1.2,
        ease: "expo.out"
    });

    // Pré-carregamento de Assets
    // Para esta fase inicial, vamos simular alguns assets ou usar os que já planejamos
    const assetsToLoad = [
        // Adicione aqui URLs de imagens reais quando disponíveis
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop"
    ];

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;
    let isLoaderClosed = false;

    const updateProgress = () => {
        loadedCount++;
        const progress = Math.round((loadedCount / totalAssets) * 100);

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.innerText = `${progress}%`;

        if (loadedCount >= totalAssets) {
            closeLoader();
        }
    };

    const closeLoader = () => {
        if (isLoaderClosed) return;
        isLoaderClosed = true;

        const tl = gsap.timeline({
            onComplete: () => {
                loader.style.display = "none";
                gsap.to(mainContent, { opacity: 1, duration: 1 });
            }
        });

        tl.to(loaderLogo, {
            y: "-100%",
            duration: 1,
            ease: "expo.inOut",
            delay: 0.5
        })
        .to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        });
    };

    // Função para pré-carregar imagens
    const preloadImages = () => {
        if (totalAssets === 0) {
            setTimeout(closeLoader, 1000);
            return;
        }

        assetsToLoad.forEach(src => {
            const img = new Image();
            // Definir eventos ANTES de definir o .src
            img.onload = updateProgress;
            img.onerror = updateProgress; // Falhas não travam o loader
            img.src = src;
        });
    };

    // Safety Timeout de 5 segundos
    const safetyTimeout = setTimeout(() => {
        if (!isLoaderClosed) {
            console.warn("Loader safety timeout reached.");
            closeLoader();
        }
    }, 5000);

    // Verificar document.readyState === "complete"
    if (document.readyState === "complete") {
        preloadImages();
    } else {
        window.addEventListener("load", preloadImages);
    }

    // 2. Lenis Smooth Scroll Initialization
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. Navbar Scroll Detection
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 4. Mobile Menu Logic
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");

        if (isOpen) {
            lenis.stop();
        } else {
            lenis.start();
        }
    };

    menuToggle.addEventListener("click", toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (mobileMenu.classList.contains("active")) {
                toggleMenu();
            }
        });
    });

    // 5. Hero Canvas Sequence
    const canvas = document.getElementById("hero-canvas");
    if (canvas) {
        const context = canvas.getContext("2d");
        const frameCount = 100;
        const frames = {
            desktop: "assets/hero-frames/desktop/",
            mobile: "assets/hero-frames/mobile/"
        };

        let currentFramesPath = window.innerWidth >= 1024 ? frames.desktop : frames.mobile;
        const images = [];
        const heroSequence = { frame: 0 };

        // Pre-load logic for canvas images
        const loadCanvasImages = () => {
            return new Promise((resolve) => {
                let loadedCount = 0;
                for (let i = 1; i <= frameCount; i++) {
                    const img = new Image();
                    const frameName = i.toString().padStart(4, '0') + '.webp';
                    // Definir eventos ANTES de definir o .src
                    img.onload = () => {
                        loadedCount++;
                        if (loadedCount === frameCount) resolve();
                    };
                    img.onerror = () => {
                        // Use a placeholder if image fails
                        loadedCount++;
                        if (loadedCount === frameCount) resolve();
                    };
                    img.src = `${currentFramesPath}${frameName}`;
                    images.push(img);
                }
            });
        };

        const render = () => {
            const img = images[heroSequence.frame];
            if (!img) return;

            // Simular object-fit: cover no canvas
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;
            const x = (canvasWidth - newWidth) / 2;
            const y = (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // GSAP ScrollTrigger for Canvas
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        mm.add({
            isDesktop: "(min-width: 1024px)",
            isMobile: "(max-width: 1023px)"
        }, (context) => {
            let { isDesktop } = context.conditions;
            currentFramesPath = isDesktop ? frames.desktop : frames.mobile;

            // Re-load images for the specific breakpoint if needed
            // (In a real scenario, we might want to avoid re-loading if they are already there)

            if (!prefersReducedMotion) {
                loadCanvasImages().then(() => {
                    gsap.to(heroSequence, {
                        frame: frameCount - 1,
                        snap: "frame",
                        ease: "none",
                        scrollTrigger: {
                            trigger: "#hero",
                            start: "top top",
                            end: "+=300%",
                            pin: true,
                            scrub: 0.5,
                            onUpdate: render
                        }
                    });
                });
            } else {
                loadCanvasImages().then(() => {
                    heroSequence.frame = frameCount - 1;
                    render();
                });
            }
        });
    }

    // 6. Stats Counter Animation
    const stats = document.querySelectorAll(".stat-item div[data-target]");
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-target"));
        const suffix = stat.getAttribute("data-suffix") || "";
        const countObj = { value: 0 };

        gsap.to(countObj, {
            value: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: stat,
                start: "top 90%",
            },
            onUpdate: () => {
                stat.innerText = Math.floor(countObj.value) + suffix;
            }
        });
    });

    // 7. Projects Horizontal Scroll
    const projectsSection = document.getElementById("projects");
    const projectsHorizontal = document.getElementById("projects-horizontal");
    const projectsPin = document.getElementById("projects-pin");

    if (projectsHorizontal) {
        mm.add({
            isDesktop: "(min-width: 1024px)",
            isMobile: "(max-width: 1023px)"
        }, (context) => {
            let { isDesktop } = context.conditions;

            if (isDesktop) {
                const scrollWidth = projectsHorizontal.offsetWidth - (window.innerWidth * 0.4); // Ajuste fino baseado no layout

                gsap.to(projectsHorizontal, {
                    x: () => -(projectsHorizontal.scrollWidth - window.innerWidth + (window.innerWidth * 0.1)),
                    ease: "none",
                    scrollTrigger: {
                        trigger: projectsSection,
                        start: "top top",
                        end: () => "+=" + projectsHorizontal.scrollWidth,
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                });
            } else {
                // Em mobile, garante que não haja transform residual
                gsap.set(projectsHorizontal, { x: 0 });
            }
        });
    }

    // 8. Testimonials Fade-in
    gsap.from(".testimonial-card", {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#testimonials",
            start: "top 70%",
        }
    });

    // 9. Lazy Video Loading
    const lazyVideos = document.querySelectorAll(".lazy-video");
    if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(video => {
                if (video.isIntersecting) {
                    const videoEl = video.target;
                    const source = videoEl.querySelector("source");
                    if (source && source.dataset.src) {
                        source.src = source.dataset.src;
                        videoEl.load();
                    }
                    videoEl.play();
                } else {
                    video.target.pause();
                }
            });
        }, {
            rootMargin: "300px"
        });

        lazyVideos.forEach(video => videoObserver.observe(video));
    }

    // 10. Smooth Scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (targetId === "#") {
                lenis.scrollTo(0);
                return;
            }

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    duration: 1.5,
                    immediate: false
                });
            }
        });
    });

    // 11. Footer Name Hover (Optional JS enhancement for smoothness)
    // Already handled via CSS transitions for simplicity as per requirements.
});
