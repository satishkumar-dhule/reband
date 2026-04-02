from playwright.sync_api import sync_playwright


def check_urls():
    base_url = "http://localhost:5000"
    pages = ["/questions", "/channels", "/questions/1", "/flashcards"]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for path in pages:
            url = f"{base_url}{path}"
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(1000)
            final_url = page.url
            print(f"Navigated to {url} -> final URL: {final_url}")
            # check if URL changed (maybe redirect)
            if final_url != url:
                print(f"  Redirected!")
            # check for hash routing
            if "#" in final_url:
                print(f"  Hash present")

        browser.close()


if __name__ == "__main__":
    check_urls()
