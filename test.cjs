const puppeteer = require('puppeteer');
(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', request => console.log('REQ FAIL:', request.url(), request.failure().errorText));

    console.log("Navigating to http://localhost:5173");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 5000));
    console.log("Clicking INITIALIZE...");
    try {
        await page.evaluate(() => document.querySelector('.initialize-btn').click());
    } catch(e) {
        console.log("Failed to click INITIALIZE:", e.message);
    }

    console.log("Waiting 5 seconds for game to load...");
    await new Promise(r => setTimeout(r, 5000));
    console.log("Done.");
    await browser.close();
})();
