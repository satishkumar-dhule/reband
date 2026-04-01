from playwright.sync_api import sync_playwright
import json
import os


def analyze_github_design():
    screenshots_dir = "/home/runner/workspace/artifacts/screenshots"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        base_url = "http://localhost:5000"

        # Ensure onboarding completed
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.evaluate("""() => {
            const prefs = JSON.parse(localStorage.getItem('user-preferences'));
            if (!prefs.onboardingComplete) {
                prefs.onboardingComplete = true;
                localStorage.setItem('user-preferences', JSON.stringify(prefs));
            }
        }""")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Collect GitHub CSS variables from :root
        github_vars = page.evaluate("""() => {
            const root = document.documentElement;
            const style = getComputedStyle(root);
            const vars = {};
            for (let i = 0; i < style.length; i++) {
                const name = style[i];
                if (name.startsWith('--color-')) {
                    vars[name] = style.getPropertyValue(name);
                }
            }
            return vars;
        }""")

        # Sample key elements and their computed styles
        elements = {
            "body": "body",
            "h1": "h1",
            "h2": "h2",
            "p": "p",
            "button.primary": 'button[type="submit"]',
            "button.secondary": 'button:not([type="submit"])',
            "a": "a",
            "input": "input",
            "card": '[class*="card"]',
            "container": '[class*="container"]',
        }

        element_styles = {}
        for name, selector in elements.items():
            try:
                styles = page.evaluate(f'''() => {{
                    const el = document.querySelector("{selector}");
                    if (!el) return null;
                    const style = window.getComputedStyle(el);
                    return {{
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        borderColor: style.borderColor,
                        borderWidth: style.borderWidth,
                        borderStyle: style.borderStyle,
                        borderRadius: style.borderRadius,
                        padding: style.padding,
                        margin: style.margin,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        lineHeight: style.lineHeight,
                        fontFamily: style.fontFamily,
                        textAlign: style.textAlign,
                        display: style.display,
                        flexDirection: style.flexDirection,
                        gap: style.gap
                    }};
                }}''')
                if styles:
                    element_styles[name] = styles
            except:
                pass

        # Check for Tailwind arbitrary values (like bg-[#fff])
        tailwind_classes = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            const classes = new Set();
            for (const el of elements) {
                for (const cls of el.classList) {
                    if (cls.includes('[') && cls.includes(']')) {
                        classes.add(cls);
                    }
                }
            }
            return Array.from(classes);
        }""")

        # Sample colors that are not GitHub variables
        sample_colors = page.evaluate("""() => {
            const elements = document.querySelectorAll('button, a, div, span, p, h1, h2, h3');
            const colors = new Set();
            for (let i = 0; i < Math.min(elements.length, 50); i++) {
                const style = window.getComputedStyle(elements[i]);
                colors.add(style.backgroundColor);
                colors.add(style.color);
            }
            return Array.from(colors);
        }""")

        browser.close()

        # Build report
        report = {
            "github_css_variables": github_vars,
            "github_variable_count": len(github_vars),
            "element_styles": element_styles,
            "tailwind_arbitrary_classes_sample": tailwind_classes[:20],  # first 20
            "sample_colors": sample_colors,
            "missing_github_vars": [],
        }

        # Check for missing essential GitHub variables
        essential_vars = [
            "--color-canvas-default",
            "--color-canvas-subtle",
            "--color-fg-default",
            "--color-fg-muted",
            "--color-border-default",
            "--color-btn-primary-bg",
            "--color-btn-primary-text",
            "--color-btn-primary-hover-bg",
        ]
        for var in essential_vars:
            if var not in github_vars:
                report["missing_github_vars"].append(var)

        # Save report
        with open(
            os.path.join(screenshots_dir, "github-design-analysis.json"), "w"
        ) as f:
            json.dump(report, f, indent=2)

        print("GitHub design analysis saved to github-design-analysis.json")
        print(f"Found {len(github_vars)} GitHub CSS variables.")
        print(f"Missing essential variables: {len(report['missing_github_vars'])}")

        # Print summary
        if report["missing_github_vars"]:
            print("Missing:", report["missing_github_vars"])

        # Check if any Tailwind arbitrary values use non-GitHub colors
        arbitrary_colors = [
            cls
            for cls in tailwind_classes
            if "bg-" in cls or "text-" in cls or "border-" in cls
        ]
        if arbitrary_colors:
            print(f"Found {len(arbitrary_colors)} Tailwind arbitrary color classes:")
            for cls in arbitrary_colors[:10]:
                print(f"  {cls}")


if __name__ == "__main__":
    analyze_github_design()
