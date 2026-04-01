from playwright.sync_api import sync_playwright
import json


def check_storage():
    base_url = "http://localhost:5000"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(base_url, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Local storage
        local_storage = page.evaluate("""() => {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items[key] = localStorage.getItem(key);
            }
            return items;
        }""")
        print("Local storage:", json.dumps(local_storage, indent=2))

        # Session storage
        session_storage = page.evaluate("""() => {
            const items = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                items[key] = sessionStorage.getItem(key);
            }
            return items;
        }""")
        print("Session storage:", json.dumps(session_storage, indent=2))

        # Cookies
        cookies = page.context.cookies()
        print("Cookies:", json.dumps(cookies, indent=2))

        browser.close()


if __name__ == "__main__":
    check_storage()
