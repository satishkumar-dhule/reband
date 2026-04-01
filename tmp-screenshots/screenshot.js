const puppeteer = require('puppeteer');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'artifacts', 'screenshots');
const baseUrl = 'http://localhost:5000';

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Homepage desktop (1280x720)
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'homepage-desktop.png'), fullPage: false });

  // 2. Homepage mobile (iPhone 13: 390x844)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'homepage-mobile.png'), fullPage: false });

  // 3. Questions page (navigate to /questions)
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`${baseUrl}/questions`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'questions-page.png'), fullPage: false });

  // 4. Channels page (navigate to /channels)
  await page.goto(`${baseUrl}/channels`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'channels-page.png'), fullPage: false });

  // 5. Question detail (click into a question)
  // First, go to questions page and click the first question link
  await page.goto(`${baseUrl}/questions`, { waitUntil: 'networkidle2' });
  // Wait for question links to appear (assuming they have class or tag)
  // We'll try to find an anchor tag that links to a question detail
  const questionLink = await page.$('a[href*="/questions/"]');
  if (questionLink) {
    await questionLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, 'question-detail.png'), fullPage: false });
  } else {
    console.error('No question link found');
    // Fallback: navigate to a sample question ID (maybe /questions/1)
    await page.goto(`${baseUrl}/questions/1`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, 'question-detail.png'), fullPage: false });
  }

  // 6. Flashcards page (navigate to /flashcards)
  await page.goto(`${baseUrl}/flashcards`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'flashcards-page.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots saved to', screenshotsDir);
}

takeScreenshots().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});