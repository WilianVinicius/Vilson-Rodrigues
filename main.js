import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Loading Screen & Asset Preloading
const frames = [
    'https://images.unsplash.com/photo-1541913080221-47b239d563fe?q=80&w=2074&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop'
];

async function preloadAssets() {
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPerc = document.getElementById('loader-perc');
    const loaderLogo = document.querySelector('.loader-logo');

    let loadedCount = 0;
    const totalAssets = frames.length + 1; // Frames + Logo

    const updateProgress = () => {
        loadedCount++;
        const progress = (loadedCount / totalAssets) * 100;
        gsap.to(loaderBar, { width: `${progress}%`, duration: 0.3 });
        loaderPerc.innerText = `${Math.floor(progress)}%`;

        if (loadedCount === totalAssets) {
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
        }
    };

    // Load logo
    const logoImg = new Image();
    logoImg.src = './logo.png';
    logoImg.onload = updateProgress;

    // Load frames
    frames.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = updateProgress;
    });
}

window.addEventListener('load', preloadAssets);

function initAnimations() {
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
            end: "+=200%",
            pin: true,
            scrub: true,
        }
    });

    frames.forEach((_, index) => {
        sequenceTl.to(`.frame-${index}`, { opacity: 0.3, duration: 1 }, index);
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

        ScrollTrigger.create({
            trigger: stat,
            start: "top 80%",
            onEnter: () => {
                gsap.to(countEl, {
                    innerText: target,
                    duration: 2,
                    snap: { innerText: 1 },
                    ease: "power2.out",
                    onUpdate: function() {
                        if (target === 100) {
                            countEl.innerText = Math.floor(this.targets()[0].innerText) + "%";
                        } else {
                            countEl.innerText = "+" + Math.floor(this.targets()[0].innerText);
                        }
                    }
                });
            }
        });
    });

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
}

ScrollTrigger.on("refresh", () => lenis.resize());
