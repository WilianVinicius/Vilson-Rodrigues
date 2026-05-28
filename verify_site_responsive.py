import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Desktop View
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        await page.goto('http://localhost:8000')

        # Wait for preloader
        await page.wait_for_selector('#loader', state='hidden', timeout=10000)

        # Scroll to projects
        await page.locator('#projects').scroll_into_view_if_needed()
        await page.wait_for_timeout(1000)

        # Take screenshot of horizontal scroll start
        await page.screenshot(path='/home/jules/verification/screenshots/desktop_projects_start.png')

        # Scroll down significantly to trigger pinning
        await page.mouse.wheel(0, 1500)
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/screenshots/desktop_projects_pushed.png')

        # Mobile View
        mobile_context = await browser.new_context(
            viewport={'width': 375, 'height': 667},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        )
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto('http://localhost:8000')
        await mobile_page.wait_for_selector('#loader', state='hidden', timeout=10000)

        # Scroll to projects
        await mobile_page.locator('#projects').scroll_into_view_if_needed()
        await mobile_page.wait_for_timeout(1000)
        await mobile_page.screenshot(path='/home/jules/verification/screenshots/mobile_projects_view.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
