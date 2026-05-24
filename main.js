import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Loading Screen & Asset Preloading
const portfolioImages = [
    '/img1.png', '/img2.png', '/img3.png', '/img4.png', '/img5.png',
    '/img6.png', '/img7.png', '/img8.png', '/img9.png', '/img10.png'
];

const HERO_FRAME_COUNT = 100;
const heroImages = [];

let isLoaded = false;
async function preloadAssets() {
    if (isLoaded) return;
    isLoaded = true;

    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPerc = document.getElementById('loader-perc');
    const loaderLogo = document.querySelector('.loader-logo');
    gsap.to(loaderLogo, { y: '0%', duration: 1.2, ease: 'expo.out' });

    let loadedCount = 0;
    const totalAssets = portfolioImages.length + HERO_FRAME_COUNT + 1; // Portfolio + Hero Frames + Logo

    const revealSite = () => {
        const tl = gsap.timeline();
        tl.to(loaderLogo, { y: '-100%', duration: 0.5, ease: 'power2.in', delay: 0.5 })
          .to(loader, {
            y: '-100%',
            duration: 1.2,
            ease: 'expo.inOut',
            onComplete: () => {
                loader.style.display = 'none';
                document.body.classList.remove('overflow-hidden');
                initAnimations();
            }
        });
    };

    const updateProgress = () => {
        loadedCount++;
        const progress = (loadedCount / totalAssets) * 100;
        gsap.to(loaderBar, { width: `${progress}%`, duration: 0.3 });
        loaderPerc.innerText = `${Math.floor(progress)}%`;

        if (loadedCount >= totalAssets) {
            revealSite();
        }
    };

    // Safety timeout - Increased for more assets
    const safetyTimeout = setTimeout(() => {
        if (loadedCount < totalAssets) {
            revealSite();
        }
    }, 15000);

    // Load logo
    const logoImg = new Image();
    logoImg.onload = updateProgress;
    logoImg.onerror = updateProgress;
    logoImg.src = '/logo.png';

    // Load Portfolio Images
    portfolioImages.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
    });

    // Load Hero Frames (Desktop by default or based on initial width)
    const folder = window.innerWidth >= 1024 ? "desktop" : "mobile";
    for (let i = 0; i < HERO_FRAME_COUNT; i++) {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = `/assets/hero-frames/${folder}/${(i + 1).toString().padStart(4, "0")}.webp`;
        heroImages.push(img);
    }
}

// Helper to load a new set of hero images (on resize)
async function reloadHeroImages(folder) {
    heroImages.length = 0; // Clear array
    const loadPromises = [];
    for (let i = 0; i < HERO_FRAME_COUNT; i++) {
        const img = new Image();
        const promise = new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        img.src = `/assets/hero-frames/${folder}/${(i + 1).toString().padStart(4, "0")}.webp`;
        heroImages.push(img);
        loadPromises.push(promise);
    }
    await Promise.all(loadPromises);
}

if (document.readyState === 'complete') {
    preloadAssets();
} else {
    window.addEventListener('load', preloadAssets);
}

function initAnimations() {
    // Scroll-Aware Navbar & WhatsApp Button
    const navbar = document.getElementById('navbar');
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    const aboutSection = document.getElementById('about');

    const onScroll = () => {
        const threshold = aboutSection
            ? aboutSection.getBoundingClientRect().top + window.scrollY - 1
            : window.innerHeight;

        if (window.scrollY >= threshold) {
            navbar?.classList.add('scrolled');
            whatsappBtn?.classList.add('visible');
        } else {
            navbar?.classList.remove('scrolled');
            whatsappBtn?.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check

    // Interactive Mobile Menu Toggle with Hamburger Animation
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (menuToggle && mobileMenu) {
        let menuOpen = false;
        const toggleMenu = () => {
            menuOpen = !menuOpen;
            if (menuOpen) {
                mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
                menuToggle.classList.add('menu-open');
                lenis.stop();
            } else {
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
                menuToggle.classList.remove('menu-open');
                lenis.start();
            }
        };
        menuToggle.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menuOpen) toggleMenu();
            });
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    duration: 1.5,
                    immediate: false
                });
            }
        });
    });

    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");
    const airship = { frame: 0 };

    const drawImage = () => {
        const img = heroImages[airship.frame];
        if (!img) return;

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

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
        let mm = gsap.matchMedia();
        mm.add({
            isDesktop: "(min-width: 1024px)",
            isMobile: "(max-width: 1023px)"
        }, (gsapContext) => {
            const { isDesktop } = gsapContext.conditions;
            canvas.width = isDesktop ? 1920 : 800;
            canvas.height = isDesktop ? 1080 : 1200;

            // Re-load images if breakpoint changes (to switch between desktop/mobile assets)
            const folder = isDesktop ? "desktop" : "mobile";
            const currentFolder = heroImages[0]?.src.includes("desktop") ? "desktop" : "mobile";

            if (folder !== currentFolder) {
                reloadHeroImages(folder).then(drawImage);
            }

            gsap.to(airship, {
                frame: HERO_FRAME_COUNT - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero-canvas-container",
                    start: "top top",
                    end: "+=300%",
                    pin: true,
                    scrub: 0.5,
                },
                onUpdate: drawImage
            });
            drawImage();
        });
    } else {
        drawImage();
    }

    gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 2,
        ease: "expo.out"
    });

    gsap.from(".hero-sub", {
        y: 40,
        opacity: 0,
        duration: 2,
        delay: 0.2,
        ease: "expo.out"
    });

    const stats = document.querySelectorAll('.stat-item');
    stats.forEach(stat => {
        const countEl = stat.querySelector('[data-count]');
        const target = parseInt(countEl.getAttribute('data-count'));
        const countObj = { value: 0 };

        ScrollTrigger.create({
            trigger: stat,
            start: "top 80%",
            onEnter: () => {
                gsap.to(countObj, {
                    value: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        if (target === 100) {
                            countEl.innerText = Math.floor(countObj.value) + "%";
                        } else {
                            countEl.innerText = "+" + Math.floor(countObj.value);
                        }
                    }
                });
            }
        });
    });

    // Responsive Animations with matchMedia
    let mmAnim = gsap.matchMedia();

    // Lazy Video Loading and Playback Control
    const lazyVideos = document.querySelectorAll('.lazy-video');
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                const source = video.querySelector('source');

                if (entry.isIntersecting) {
                    if (source && source.dataset.src) {
                        source.src = source.dataset.src;
                        source.removeAttribute('data-src');
                        video.load();
                    }
                    video.play();
                } else {
                    video.pause();
                }
            });
        }, {
            rootMargin: "300px"
        });

        lazyVideos.forEach((video) => {
            videoObserver.observe(video);
        });
    }

    mmAnim.add("(min-width: 1024px)", () => {
        // Horizontal Scroll
        const horizontalScroll = document.querySelector('.horizontal-scroll');
        if (horizontalScroll) {
            gsap.to(horizontalScroll, {
                x: () => -(horizontalScroll.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: ".projects-wrapper",
                    start: "top top",
                    end: () => `+=${horizontalScroll.scrollWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                }
            });
        }

        // About Parallax
        gsap.set("#about", { yPercent: 50 });
        gsap.to("#about", {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero-canvas-container",
                start: "bottom bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}
