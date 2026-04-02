from playwright.sync_api import sync_playwright
import json


def inspect_onboarding():
    base_url = "http://localhost:5000"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Get all buttons and links
        buttons = page.evaluate("""() => {
            const elements = [];
            document.querySelectorAll('button, a, input[type="submit"]').forEach(el => {
                elements.push({
                    tag: el.tagName,
                    text: el.innerText,
                    href: el.href || null,
                    type: el.type || null,
                    class: el.className,
                    id: el.id
                });
            });
            return elements;
        }""")
        print("Buttons/links found:")
        for btn in buttons:
            print(btn)

        # Check for any form or onboarding steps
        forms = page.evaluate("""() => {
            return document.querySelectorAll('form').length;
        }""")
        print(f"Forms: {forms}")

        # Check for any hidden elements that might be steps
        steps = page.evaluate("""() => {
            const steps = [];
            document.querySelectorAll('[class*="step"], [class*="onboard"], [data-step]').forEach(el => {
                steps.push({
                    class: el.className,
                    hidden: el.hidden || el.style.display === 'none',
                    text: el.innerText.substring(0, 100)
                });
            });
            return steps;
        }""")
        print("Steps:", json.dumps(steps, indent=2))

        # Take a screenshot for reference
        page.screenshot(
            path="/home/runner/workspace/artifacts/screenshots/onboarding.png"
        )

        browser.close()


if __name__ == "__main__":
    inspect_onboarding()
