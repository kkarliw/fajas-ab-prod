const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:4174/shop');
  await new Promise(r => setTimeout(r, 2000));
  
  const getDims = async () => {
    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.product-card'));
      if (!cards.length) return { error: 'No cards found' };
      const card = cards[0];
      const grid = card.parentElement;
      const wrapper = grid.parentElement;
      const section = wrapper.parentElement;
      return {
        cardWidth: card.getBoundingClientRect().width,
        gridWidth: grid.getBoundingClientRect().width,
        wrapperWidth: wrapper.getBoundingClientRect().width,
        sectionWidth: section.getBoundingClientRect().width,
        numCards: cards.length
      };
    });
  };
  
  console.log("ALL PRODUCTS:", await getDims());
  
  await page.goto('http://localhost:4174/shop?tipo_prenda=Brasieres');
  await new Promise(r => setTimeout(r, 2000));
  console.log("BRASIERES:", await getDims());
  
  await browser.close();
})();
