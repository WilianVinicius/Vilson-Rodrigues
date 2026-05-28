const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize Lenis for smooth scrolling
let lenis;
if (!prefersReducedMotion) {
    lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });
}

if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
}

gsap.ticker.lagSmoothing(0);

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

// Asset Loading & Preloader Logic
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPerc = document.getElementById('loader-perc');

let assetsLoaded = 0;
const assets = [...document.querySelectorAll('img')];
const totalAssets = assets.length;

function updateLoader() {
    assetsLoaded++;
    const progress = (assetsLoaded / (totalAssets || 1)) * 100;
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
      .from('.hero-title', { y: 100, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=0.6')
      .from('.hero-sub', { y: 40, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=1.3')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=1.2')
      .call(() => {
          loader.style.display = 'none';
          initAnimations();
          initHeroCanvas();
          initLazyVideo();
      });
}

// Preloader Logo Entry Animation
gsap.from('.loader-logo', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    delay: 0.2
});

// Check if assets are already loaded
if (totalAssets === 0) {
    setTimeout(revealSite, 1000); // Give time for logo entry
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
    if (loader && loader.style.display !== 'none') revealSite();
}, 4000);

/**
 * Blueprint Canvas Animation
 * Programmatically draws a house structure based on scroll
 */
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const blueprint = { frame: 0 };

    function drawBlueprint(progress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#f2edde';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.3;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 100;
        const size = Math.min(canvas.width, canvas.height) * 0.4;

        // Base Line
        if (progress > 5) {
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY);
            ctx.lineTo(centerX + size, centerY);
            ctx.stroke();
        }

        // Walls
        if (progress > 20) {
            const wallH = (progress - 20) / 30 * size;
            const h = Math.min(wallH, size * 0.8);
            ctx.setLineDash([]);
            ctx.strokeRect(centerX - size * 0.6, centerY - h, size * 1.2, h);
        }

        // Roof
        if (progress > 50) {
            const roofP = (progress - 50) / 30;
            const p = Math.min(roofP, 1);
            ctx.beginPath();
            ctx.moveTo(centerX - size * 0.7, centerY - size * 0.8);
            ctx.lineTo(centerX, centerY - size * 0.8 - (size * 0.4 * p));
            ctx.lineTo(centerX + size * 0.7, centerY - size * 0.8);
            ctx.stroke();
        }

        // Details (Windows/Door)
        if (progress > 80) {
            ctx.globalAlpha = (progress - 80) / 20 * 0.3;
            ctx.strokeRect(centerX - size * 0.1, centerY - size * 0.3, size * 0.2, size * 0.3); // Door
            ctx.strokeRect(centerX - size * 0.4, centerY - size * 0.6, size * 0.15, size * 0.15); // Window L
            ctx.strokeRect(centerX + size * 0.25, centerY - size * 0.6, size * 0.15, size * 0.15); // Window R
        }
    }

    if (prefersReducedMotion) {
        drawBlueprint(100);
        return;
    }

    gsap.to(blueprint, {
        frame: 100,
        ease: "none",
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
            onUpdate: (self) => drawBlueprint(self.progress * 100)
        }
    });
}

/**
 * Lazy Video Observer
 * Loads video src and manages playback based on visibility
 */
function initLazyVideo() {
    const videos = document.querySelectorAll('.lazy-video');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (!video.src) {
                    video.src = video.dataset.src;
                    video.load();
                }
                video.play();
                gsap.to(video, { opacity: 1, duration: 1 });
            } else {
                video.pause();
                gsap.to(video, { opacity: 0, duration: 0.5 });
            }
        });
    }, { threshold: 0.1 });

    videos.forEach(v => observer.observe(v));
}

function initAnimations() {
    if (prefersReducedMotion) return;

    // Navbar Threshold Logic
    const navbar = document.getElementById('navbar');
    const navContainer = document.getElementById('nav-container');
    const secondSection = document.getElementById('commitment');
    const whatsappBtn = document.querySelector('.whatsapp-btn');

    ScrollTrigger.create({
        trigger: secondSection,
        start: "top 100px",
        onEnter: () => {
            navbar.classList.add('scrolled');
            whatsappBtn.classList.add('visible');
            gsap.to(navContainer, { py: '1.5rem', duration: 0.5, ease: 'power2.out' });
            gsap.to(whatsappBtn, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.5 });
        },
        onLeaveBack: () => {
            navbar.classList.remove('scrolled');
            whatsappBtn.classList.remove('visible');
            gsap.to(navContainer, { py: '2.5rem', duration: 0.5, ease: 'power2.out' });
            gsap.to(whatsappBtn, { opacity: 0, scale: 0.9, pointerEvents: 'none', duration: 0.5 });
        }
    });

    // Mobile Menu Toggle Logic
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;

    const toggleMenu = (forceState) => {
        menuOpen = forceState !== undefined ? forceState : !menuOpen;
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

    if (menuToggle) menuToggle.addEventListener('click', () => toggleMenu());

    // Smooth Scroll & Menu Close on Link Click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();

            // Close menu if open
            if (menuOpen) toggleMenu(false);

            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

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

    // Responsive Animations Wrapper
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        // Horizontal Projects with Forced View (Desktop Only)
        const track = document.getElementById('projects-track');
        const items = gsap.utils.toArray(".project-item");

        if (track && items.length > 0) {
            track.style.overflowX = 'hidden';

            const scrollTween = gsap.to(track, {
                x: () => -(track.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: "#projects",
                    pin: true,
                    scrub: 1,
                    start: "top top",
                    end: () => "+=" + (track.scrollWidth - window.innerWidth),
                    invalidateOnRefresh: true,
                }
            });

            // Add Draggable to the track and sync with scroll
            Draggable.create(track, {
                type: "x",
                bounds: {
                    minX: -(track.scrollWidth - window.innerWidth),
                    maxX: 0
                },
                inertia: true,
                onDrag: function() {
                    const progress = this.x / -(track.scrollWidth - window.innerWidth);
                    const st = scrollTween.scrollTrigger;
                    const scrollPos = st.start + (progress * (st.end - st.start));
                    lenis.scrollTo(scrollPos, { immediate: true });
                },
                onThrowUpdate: function() {
                    const progress = this.x / -(track.scrollWidth - window.innerWidth);
                    const st = scrollTween.scrollTrigger;
                    const scrollPos = st.start + (progress * (st.end - st.start));
                    lenis.scrollTo(scrollPos, { immediate: true });
                }
            });

            // Sophisticated item reveal during horizontal scroll
            items.forEach((item) => {
                gsap.from(item.querySelector('.aspect-video'), {
                    scale: 1.2,
                    opacity: 0.5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: item,
                        containerAnimation: scrollTween,
                        start: "left 100%",
                        end: "left 50%",
                        scrub: true
                    }
                });
            });
        }

        // Hero Parallax Refinement
        gsap.to(".hero-title", {
            y: 150,
            opacity: 0,
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

    mm.add("(max-width: 1023px)", () => {
        const track = document.getElementById('projects-track');
        if (track) track.style.overflowX = 'auto';

        // Simple reveal for projects on mobile
        gsap.utils.toArray(".project-item").forEach(item => {
            gsap.from(item, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                }
            });
        });
    });

    // Universal Animations (All Devices)
    gsap.from("#contact .grid > div", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#contact",
            start: "top 80%",
        }
    });

    // FAQ Accordion Logic
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            const isOpen = item.classList.contains('active');

            // Close all others
            document.querySelectorAll('.faq-item').forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-answer').style.maxHeight = '0px';
                other.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
            });

            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(45deg)';
            }
        });
    });

    // Methodology Steps Reveal
    gsap.utils.toArray('.method-step').forEach(step => {
        gsap.from(step, {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: {
                trigger: step,
                start: "top 85%",
            }
        });
    });

    // Expertise Cards Reveal
    gsap.from("#expertise .grid > div", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#expertise .grid",
            start: "top 80%",
        }
    });

    // Service Area Cities Reveal
    gsap.from(".city-item", {
        x: -20,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#service-area .grid",
            start: "top 85%",
        }
    });

    // Commitment Items Reveal
    gsap.from(".commitment-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#commitment",
            start: "top 90%",
        }
    });

    // Monumental Text Scroll
    gsap.to(".monumental-text", {
        xPercent: -20,
        scrollTrigger: {
            trigger: "#contact",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        }
    });
}
