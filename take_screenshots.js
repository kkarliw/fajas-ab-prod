const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:4174/shop');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot_all.png' });
  
  await page.goto('http://localhost:4174/shop?category=Fajas');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot_fajas.png' });
  
  await browser.close();
})();
