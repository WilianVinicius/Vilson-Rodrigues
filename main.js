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
const frames = [
    './img1.png', './img2.png', './img3.png', './img4.png', './img5.png',
    './img6.png', './img7.png', './img8.png', './img9.png', './img10.png'
];

let isLoaded = false;
async function preloadAssets() {
    if (isLoaded) return;
    isLoaded = true;

    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPerc = document.getElementById('loader-perc');
    const loaderLogo = document.querySelector('.loader-logo');

    let loadedCount = 0;
    const totalAssets = frames.length + 1; // Frames + Logo

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

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
        if (loadedCount < totalAssets) {
            revealSite();
        }
    }, 5000);

    // Load logo
    const logoImg = new Image();
    logoImg.onload = updateProgress;
    logoImg.onerror = updateProgress;
    logoImg.src = './logo.png';

    // Load frames
    frames.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
    });
}

if (document.readyState === 'complete') {
    preloadAssets();
} else {
    window.addEventListener('load', preloadAssets);
}

function initAnimations() {
    // Mobile Menu Logic
    const menuToggle = document.getElementById('menu-toggle');
    const menuToggleText = document.getElementById('menu-toggle-text');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            gsap.to(mobileMenu, { opacity: 1, pointerEvents: 'auto', duration: 0.5 });
            menuToggleText.innerText = 'FECHAR';
            lenis.stop();
        } else {
            gsap.to(mobileMenu, { opacity: 0, pointerEvents: 'none', duration: 0.5 });
            menuToggleText.innerText = 'MENU';
            lenis.start();
        }
    };

    menuToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', () => {
        if (isMenuOpen) toggleMenu();
    }));

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

    const sequenceContainer = document.querySelector('#construction-sequence .relative');

    frames.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = `absolute inset-0 w-full h-full object-cover opacity-0 frame-${index}`;
        sequenceContainer.appendChild(img);
    });

    const sequenceTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "+=300%", // Increased for more frames
            pin: true,
            scrub: true,
        }
    });

    frames.forEach((_, index) => {
        sequenceTl.to(`.frame-${index}`, { opacity: 0.4, duration: 1 }, index);
        if (index > 0) {
            sequenceTl.to(`.frame-${index-1}`, { opacity: 0, duration: 1 }, index);
        }
    });

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
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
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
                trigger: ".hero",
                start: "bottom bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}
