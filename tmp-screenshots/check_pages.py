from playwright.sync_api import sync_playwright
import json


def check_pages():
    base_url = "http://localhost:5000"
    pages = {
        "homepage": "",
        "questions": "/questions",
        "channels": "/channels",
        "question-detail": "/questions/1",
        "flashcards": "/flashcards",
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        results = {}

        for name, path in pages.items():
            url = f"{base_url}{path}"
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(1000)
            title = page.title()
            # get some text content
            h1 = page.evaluate("""() => {
                const h1 = document.querySelector('h1');
                return h1 ? h1.innerText : null;
            }""")
            # get any error messages
            errors = []
            page.on(
                "console",
                lambda msg: errors.append(msg.text) if msg.type == "error" else None,
            )
            # reload to capture console errors
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(500)
            results[name] = {"url": url, "title": title, "h1": h1, "errors": errors}

        browser.close()
        print(json.dumps(results, indent=2))


if __name__ == "__main__":
    check_pages()
