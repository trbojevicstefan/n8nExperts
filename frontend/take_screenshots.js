import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('Capturing Landing Page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'landing_page.png', fullPage: true });

    console.log('Capturing Marketplace...');
    await page.goto('http://localhost:5173/experts', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'marketplace.png', fullPage: true });

    await browser.close();
})();
