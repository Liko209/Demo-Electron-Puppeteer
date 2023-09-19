const { app, BrowserWindow } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");

(async () => {
  try {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const window = new BrowserWindow();
    const url = "https://www.dealdazzle.com";
    await window.loadURL(url);

    const page = await pie.getPage(browser, window);

    await page.goto("https://www.facebook.com/");

    const emailInputSelector = "#email";
    const passwordInputSelector = "#pass";
    const emailInput = await page.$(emailInputSelector);
    const passwordInput = await page.$(passwordInputSelector);

    if (emailInput) await page.type("#email", "Your-Email@email.com");
    if (passwordInput) await page.type("#pass", "You-Password");

    const loginBtnSelector = '[data-testid="royal_login_button"]';
    const loginBtn = await page.$(loginBtnSelector);
    if (loginBtn) await page.click(loginBtnSelector);

    await page.waitForTimeout(3000);

    const homeBtnSelector = '[aria-label="Home"]';
    const homeBtn = await page.$(homeBtnSelector);
    if (homeBtn) await page.click(homeBtnSelector);

    await page.waitForTimeout(2000);

    const firstPostCardSelector = '[data-pagelet="FeedUnit_0"]';
    const firstPostCard = await page.$(firstPostCardSelector);
    if (firstPostCard) {
      const avatarSelector = 'div[data-pagelet="FeedUnit_0"] a:first-child';
      const avatar = await page.$(avatarSelector);
      if (avatar) await page.click(avatarSelector);
      await page.waitForTimeout(3000);
      const msgBtnSelector = '[aria-label="Message"]';
      const msgBtn = await page.$(msgBtnSelector);
      if (msgBtn) await page.click(msgBtnSelector);

      await page.waitForTimeout(3000);

      await page.keyboard.type("Hellooo, How is going today?");
      await page.keyboard.press("Enter");
    }
  } catch (error) {
    console.error(error);
  }
})();
