from playwright.sync_api import sync_playwright
import os

def run_verify(page):
    # Navigate to the local dev server (default Vite port is 5173)
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000) # Wait for preloader

    # Screenshot 1: Hero Section (Floating Container Check)
    page.screenshot(path="/home/jules/verification/screenshots/hero_floating.png")
    page.wait_for_timeout(500)

    # Scroll to About section
    page.evaluate("window.scrollTo(0, 1000)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/about_section.png")

    # Scroll to Video CTA section (Verify Linen background)
    page.evaluate("window.scrollBy(0, 2000)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/video_cta.png")

    # Scroll to bottom
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/footer.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_verify(page)
        finally:
            context.close()
            browser.close()
