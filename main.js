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

// Asset Loading & Preloader Logic
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPerc = document.getElementById('loader-perc');

let assetsLoaded = 0;
const assets = [...document.querySelectorAll('img')];
const totalAssets = assets.length;

function updateLoader() {
    assetsLoaded++;
    const progress = (assetsLoaded / totalAssets) * 100;
    gsap.to(loaderBar, { width: `${progress}%`, duration: 0.4 });
    loaderPerc.innerText = `${Math.round(progress)}%`;

    if (assetsLoaded >= totalAssets) {
        setTimeout(revealSite, 500);
    }
}

function revealSite() {
    const tl = gsap.timeline();
    tl.to('.loader-logo', { y: '-110%', duration: 0.8, ease: 'expo.inOut' })
      .to(loader, { y: '-100%', duration: 1.2, ease: 'expo.inOut' }, '-=0.4')
      .set(document.body, { overflow: 'auto' })
      .call(() => {
          loader.style.display = 'none';
          initAnimations();
      });
}

// Check if assets are already loaded
if (totalAssets === 0) {
    revealSite();
} else {
    assets.forEach(asset => {
        if (asset.complete) {
            updateLoader();
        } else {
            asset.addEventListener('load', updateLoader);
            asset.addEventListener('error', updateLoader);
        }
    });
}

// Fallback if loading takes too long
setTimeout(() => {
    if (loader.style.display !== 'none') revealSite();
}, 4000);

function initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Navbar Threshold Logic
    const navbar = document.getElementById('navbar');
    const navContainer = document.getElementById('nav-container');
    const aboutSection = document.getElementById('about');
    const whatsappBtn = document.querySelector('.whatsapp-btn');

    ScrollTrigger.create({
        trigger: aboutSection,
        start: "top 100px",
        onEnter: () => {
            navbar.classList.add('scrolled');
            gsap.to(navContainer, { py: '1.5rem', duration: 0.5, ease: 'power2.out' });
            gsap.to(whatsappBtn, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.5 });
        },
        onLeaveBack: () => {
            navbar.classList.remove('scrolled');
            gsap.to(navContainer, { py: '2.5rem', duration: 0.5, ease: 'power2.out' });
            gsap.to(whatsappBtn, { opacity: 0, scale: 0.9, pointerEvents: 'none', duration: 0.5 });
        }
    });

    // Mobile Menu
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;

    menuToggle.addEventListener('click', () => {
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
    });

    // Hero Visual
    if (!prefersReducedMotion) {
        gsap.to(".hero-visual", {
            scale: 1,
            opacity: 0.1,
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // Stats Counter
    document.querySelectorAll('.stat-item').forEach(stat => {
        const countEl = stat.querySelector('[data-count]');
        const target = parseInt(countEl.getAttribute('data-count'));
        const obj = { val: 0 };

        ScrollTrigger.create({
            trigger: stat,
            start: "top 85%",
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        countEl.innerText = (target === 100) ? Math.floor(obj.val) + "%" : "+" + Math.floor(obj.val);
                    }
                });
            }
        });
    });

    // Horizontal Projects
    if (!prefersReducedMotion) {
        const horizontalContainer = document.querySelector('.projects-inner');

        gsap.matchMedia().add("(min-width: 1024px)", () => {
            gsap.to(horizontalContainer, {
                x: () => -(horizontalContainer.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: "#projects",
                    start: "top top",
                    end: () => `+=${horizontalContainer.scrollWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        });
    }
}
