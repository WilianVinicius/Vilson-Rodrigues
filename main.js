/**
 * VILSON RODRIGUES PORTFOLIO
 * Main Logic - Loader & Initial Setup
 */

document.addEventListener("DOMContentLoaded", () => {

    // 1. Loader & Asset Preloading
    const loader = document.getElementById("loader");
    const loaderLogo = document.getElementById("loader-logo");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const mainContent = document.getElementById("main-content");
    const navbar = document.getElementById("navbar");

    // Initial Logo Animation (Slide up)
    gsap.to(loaderLogo, {
        y: "0%",
        duration: 1.2,
        ease: "expo.out"
    });

    // Asset List (To be filled with real URLs later)
    const assetsToLoad = ["logo.png"]; // Include the logo in preloading

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;
    let isLoaderClosed = false;

    const updateProgress = () => {
        loadedCount++;
        const progress = totalAssets > 0 ? Math.round((loadedCount / totalAssets) * 100) : 100;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.innerText = `${progress}%`;

        if (loadedCount >= totalAssets) {
            // Short delay to show 100%
            setTimeout(closeLoader, 500);
        }
    };

    const closeLoader = () => {
        if (isLoaderClosed) return;
        isLoaderClosed = true;

        const tl = gsap.timeline({
            onComplete: () => {
                loader.style.display = "none";
            }
        });

        tl.to(loaderLogo, {
            y: "-100%",
            duration: 1,
            ease: "expo.inOut",
            delay: 0.2
        })
        .to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        }, "-=0.5")
        .to([mainContent, navbar], {
            opacity: 1,
            pointerEvents: "auto",
            duration: 1,
            ease: "power2.out"
        }, "-=0.3");
    };

    // Preload Logic
    const startPreloading = () => {
        if (totalAssets === 0) {
            // Fake progress if no assets
            let fakeProgress = 0;
            const interval = setInterval(() => {
                fakeProgress += Math.random() * 20;
                if (fakeProgress >= 100) {
                    fakeProgress = 100;
                    clearInterval(interval);
                    updateProgress();
                }
                if (progressBar) progressBar.style.width = `${fakeProgress}%`;
                if (progressText) progressText.innerText = `${Math.round(fakeProgress)}%`;
            }, 100);
            return;
        }

        assetsToLoad.forEach(src => {
            const img = new Image();
            // Events defined BEFORE src
            img.onload = updateProgress;
            img.onerror = updateProgress; // Errors don't block
            img.src = src;
        });
    };

    // Safety Timeout (5 seconds)
    const safetyTimeout = setTimeout(() => {
        if (!isLoaderClosed) {
            console.warn("Loader safety timeout triggered.");
            closeLoader();
        }
    }, 5000);

    // Initial load check
    if (document.readyState === "complete") {
        startPreloading();
    } else {
        window.addEventListener("load", startPreloading);
    }

    // 2. Lenis Smooth Scroll Initialization
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

});
