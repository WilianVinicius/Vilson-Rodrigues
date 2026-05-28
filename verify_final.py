import asyncio
from playwright.async_api import async_playwright
import os

async def verify_new_features():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Helper to ensure screenshot directory exists
        screenshot_dir = "/home/jules/verification/screenshots_v2"
        os.makedirs(screenshot_dir, exist_ok=True)

        # Desktop Test
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('http://localhost:8080')

        # Wait for loader
        await page.wait_for_selector('#loader', state='hidden', timeout=10000)

        # 1. Verify Canvas in Hero
        canvas_exists = await page.query_selector('#hero-canvas')
        print(f"Canvas in Hero exists: {canvas_exists is not None}")
        await page.screenshot(path=f"{screenshot_dir}/desktop_hero_canvas.png")

        # 2. Verify Video Section (Scroll to it)
        await page.evaluate("document.querySelector('#process').scrollIntoView()")
        await page.wait_for_timeout(2000) # Wait for IntersectionObserver
        video = await page.query_selector('.lazy-video')
        video_src = await video.get_attribute('src')
        print(f"Lazy Video SRC: {video_src}")
        await page.screenshot(path=f"{screenshot_dir}/desktop_video_section.png")

        # 3. Verify Horizontal Scroll Pinning (Scroll near Projects)
        await page.evaluate("document.querySelector('#projects').scrollIntoView()")
        await page.mouse.wheel(0, 1000)
        await page.wait_for_timeout(1000)
        # Check if projects track shifted
        track = await page.query_selector('#projects-track')
        style = await track.get_attribute('style')
        print(f"Projects track style after scroll: {style}")
        await page.screenshot(path=f"{screenshot_dir}/desktop_projects_pinned.png")

        # Mobile Test
        mobile_page = await browser.new_page(viewport={'width': 375, 'height': 667})
        await mobile_page.goto('http://localhost:8080')
        await mobile_page.wait_for_selector('#loader', state='hidden', timeout=10000)

        # Check mobile projects (should be vertical/native scroll)
        await mobile_page.evaluate("document.querySelector('#projects').scrollIntoView()")
        await mobile_page.wait_for_timeout(1000)
        await mobile_page.screenshot(path=f"{screenshot_dir}/mobile_projects.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_new_features())
