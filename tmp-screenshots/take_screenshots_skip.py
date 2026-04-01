from playwright.sync_api import sync_playwright
import os
import json


def take_screenshots_with_skip():
    screenshots_dir = "/home/runner/workspace/artifacts/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        base_url = "http://localhost:5000"

        # Go to homepage (onboarding)
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Click "Skip for now" button
        skip_button = page.get_by_text("Skip for now")
        if skip_button:
            skip_button.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print(f"After skip, URL: {page.url}")
        else:
            print("Skip button not found")

        # Now take screenshots of homepage (should be main app)
        page.set_viewport_size({"width": 1280, "height": 720})
        page.wait_for_timeout(500)
        page.screenshot(
            path=os.path.join(screenshots_dir, "homepage-desktop.png"), full_page=False
        )

        # Mobile viewport
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)
        page.screenshot(
            path=os.path.join(screenshots_dir, "homepage-mobile.png"), full_page=False
        )

        # Questions page
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto(f"{base_url}/questions", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(
            path=os.path.join(screenshots_dir, "questions-page.png"), full_page=False
        )

        # Channels page
        page.goto(f"{base_url}/channels", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(
            path=os.path.join(screenshots_dir, "channels-page.png"), full_page=False
        )

        # Question detail
        page.goto(f"{base_url}/questions/1", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(
            path=os.path.join(screenshots_dir, "question-detail.png"), full_page=False
        )

        # Flashcards page
        page.goto(f"{base_url}/flashcards", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(
            path=os.path.join(screenshots_dir, "flashcards-page.png"), full_page=False
        )

        # Inspect visual design
        print("Inspecting visual design...")
        # Go back to homepage
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(500)

        bg_color = page.evaluate("""() => {
            const style = window.getComputedStyle(document.body);
            return style.backgroundColor;
        }""")
        font_family = page.evaluate("""() => {
            const style = window.getComputedStyle(document.body);
            return style.fontFamily;
        }""")
        has_github_vars = page.evaluate("""() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            return style.getPropertyValue('--color-canvas-default') !== '';
        }""")

        # Check some button styles
        button_colors = page.evaluate("""() => {
            const btn = document.querySelector('button');
            if (!btn) return null;
            const style = window.getComputedStyle(btn);
            return {
                bg: style.backgroundColor,
                color: style.color,
                border: style.borderColor,
                font: style.fontFamily
            };
        }""")

        observations = {
            "background_color": bg_color,
            "font_family": font_family,
            "github_color_vars": has_github_vars,
            "button_sample": button_colors,
            "notes": "Manual inspection needed for colors, fonts, spacing.",
        }

        with open(os.path.join(screenshots_dir, "design-observations.json"), "w") as f:
            json.dump(observations, f, indent=2)

        browser.close()
        print(f"Screenshots saved to {screenshots_dir}")
        print("Design observations saved to design-observations.json")


if __name__ == "__main__":
    take_screenshots_with_skip()
