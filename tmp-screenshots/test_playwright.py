from playwright.sync_api import sync_playwright
import sys


def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5000")
        print("Page title:", page.title())
        browser.close()
        print("Success")


if __name__ == "__main__":
    test()
