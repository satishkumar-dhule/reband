from playwright.sync_api import sync_playwright
import os
import json


def take_screenshots():
    screenshots_dir = "/home/runner/workspace/artifacts/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        base_url = "http://localhost:5000"

        # 1. Homepage desktop (1280x720)
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(500)  # allow React to hydrate
        page.screenshot(
            path=os.path.join(screenshots_dir, "homepage-desktop.png"), full_page=False
        )

        # 2. Homepage mobile (iPhone 13: 390x844)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(500)  # allow React to hydrate
        page.screenshot(
            path=os.path.join(screenshots_dir, "homepage-mobile.png"), full_page=False
        )

        # 3. Questions page (navigate to /questions)
        page.set_viewport_size({"width": 1280, "height": 720})
        page.goto(f"{base_url}/questions", wait_until="networkidle")
        page.wait_for_timeout(500)  # allow React to hydrate
        page.screenshot(
            path=os.path.join(screenshots_dir, "questions-page.png"), full_page=False
        )

        # 4. Channels page (navigate to /channels)
        page.goto(f"{base_url}/channels", wait_until="networkidle")
        page.wait_for_timeout(500)  # allow React to hydrate
        page.screenshot(
            path=os.path.join(screenshots_dir, "channels-page.png"), full_page=False
        )

        # 5. Question detail (navigate to a question)
        # Assume there is at least one question with ID 1
        page.goto(f"{base_url}/questions/1", wait_until="networkidle")
        page.wait_for_timeout(1000)  # allow React to render
        page.screenshot(
            path=os.path.join(screenshots_dir, "question-detail.png"),
            full_page=False,
        )

        # 6. Flashcards page (navigate to /flashcards)
        page.goto(f"{base_url}/flashcards", wait_until="networkidle")
        page.wait_for_timeout(500)  # allow React to hydrate
        page.screenshot(
            path=os.path.join(screenshots_dir, "flashcards-page.png"), full_page=False
        )

        # Now inspect for visual issues with GitHub design system
        print("Inspecting visual design...")
        issues = []

        # Check color tokens (should use GitHub CSS variables)
        # We'll evaluate JS to get computed styles of key elements
        # For simplicity, we'll just note that we need to inspect manually.
        # Let's capture a few computed styles for reporting.

        page.goto(base_url, wait_until="networkidle")
        # Check background color
        bg_color = page.evaluate("""() => {
            const style = window.getComputedStyle(document.body);
            return style.backgroundColor;
        }""")
        print(f"Body background color: {bg_color}")

        # Check font family
        font_family = page.evaluate("""() => {
            const style = window.getComputedStyle(document.body);
            return style.fontFamily;
        }""")
        print(f"Body font family: {font_family}")

        # Check if GitHub color variables are defined
        has_github_vars = page.evaluate("""() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            return style.getPropertyValue('--color-canvas-default') !== '';
        }""")
        print(f"Has GitHub color variables: {has_github_vars}")

        # Check for any custom colors that are not GitHub tokens
        # We'll sample a few buttons and text elements
        # This is a basic check; a thorough inspection would require more analysis.

        # Save observations
        observations = {
            "background_color": bg_color,
            "font_family": font_family,
            "github_color_vars": has_github_vars,
            "notes": "Manual inspection needed for colors, fonts, spacing.",
        }

        with open(os.path.join(screenshots_dir, "design-observations.json"), "w") as f:
            json.dump(observations, f, indent=2)

        browser.close()
        print(f"Screenshots saved to {screenshots_dir}")
        print("Design observations saved to design-observations.json")


if __name__ == "__main__":
    take_screenshots()
