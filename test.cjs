const puppeteer = require('puppeteer');
(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    
    // Mobile emulation
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log("Navigating to http://localhost:5173");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log("Dismissing Welcome Screen...");
    await page.mouse.click(100, 100); // Click anywhere
    
    await new Promise(r => setTimeout(r, 2000));
    console.log("Clicking INITIALIZE_NEW_RUN...");
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
