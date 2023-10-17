const { app, BrowserWindow } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const ChatBot = require("./chatBot");

const conversationConfig = {
  item: "mortal Kombat",
  ori_price: "$350",
  tar_price_start: "$280",
  tar_price_end: "$300",
  character: "normal",
};

(async () => {
  try {
    await pie.initialize(app);
    const browser = await pie.connect(app, puppeteer);
    const window = new BrowserWindow();
    const url = "https://www.dealdazzle.com";
    await window.loadURL(url);

    const page = await pie.getPage(browser, window);

    await page.goto("https://www.facebook.com/");
    window.webContents.openDevTools({ mode: "right" });

    const emailInputSelector = "#email";
    const passwordInputSelector = "#pass";
    const emailInput = await page.$(emailInputSelector);
    const passwordInput = await page.$(passwordInputSelector);

    if (emailInput) await page.type("#email", "leecoor97@email.com");
    if (passwordInput) await page.type("#pass", "Test1234!");

    const loginBtnSelector = '[data-testid="royal_login_button"]';
    const loginBtn = await page.$(loginBtnSelector);
    if (loginBtn) await page.click(loginBtnSelector);

    await page.waitForTimeout(3000);

    const messengerBtnSelector = '[aria-label^="Messenger"]';
    const messengerBtn = await page.$(messengerBtnSelector);

    if (messengerBtn) {
      await page.click(messengerBtnSelector);
      await page.waitForTimeout(500);
      const searchInputSelector = '[aria-label="Search Messenger"]';
      const searchInput = await page.$(searchInputSelector);
      await page.waitForTimeout(200);
      if (searchInput) await page.type(searchInputSelector, "Shi Xu");
      await page.waitForTimeout(2000);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }

    await page.waitForTimeout(3000);

    const chatBot = new ChatBot(page); // 创建并实例化 ChatBot 对象

    const conversationId = await chatBot.createConversation(conversationConfig); // 创建一个新的会话

    window.on("close", async (event) => {
      event.preventDefault(); // 阻止窗口立即关闭

      try {
        await chatBot.closeConversation(conversationId); // 等待 ChatBot 的网络请求完成
        window.destroy(); // 等待网络请求完成后关闭窗口
      } catch (error) {
        console.error(error);
        // 可根据需要处理错误情况
      }
    });

    await page.exposeFunction(
      "type",
      async (text) => await page.keyboard.type(text)
    );

    await page.exposeFunction(
      "enter",
      async (text) => await page.keyboard.press("Enter")
    );

    await page.exposeFunction("createConversation", async () => {
      return chatBot.createConversation(data);
    });

    await page.exposeFunction("closeConversation", async () => {
      return chatBot.closeConversation(conversationId);
    });

    await page.exposeFunction("receiveMessage", async (message) => {
      return chatBot.receiveMessage(conversationId, message);
    });

    // 监听聊天记录窗口的变化
    await page.evaluate(() => {
      let currentSender = "Buyer";
      const chatWindow = document.querySelector(
        '[aria-label^="Messages in conversation with"]'
      );
      if (chatWindow) {
        const wrapper = chatWindow.querySelector(
          `[aria-label^="Messages in conversation with"] div > div > div > div > div:nth-child(3) > div`
        );
        let prevMsgCount = wrapper?.childElementCount;
        // 创建一个 MutationObserver 实例
        const observer = new MutationObserver((mutationsList) => {
          // 在回调函数中处理聊天记录窗口的变化
          for (const mutation of mutationsList) {
            // 处理变化的逻辑...
            if (
              mutation.type === "childList" &&
              mutation.addedNodes.length > 0
            ) {
              mutation.addedNodes.forEach(async (node) => {
                // 获取最后一条消息是谁发送的
                const role = node.getAttribute("role");
                const childElements = Array.from(wrapper.children);
                const lastMsgSender = childElements[
                  childElements.length - 2
                ].querySelector('[dir="auto"] > span');

                console.log(
                  "Bargaining",
                  "lastMsgSender",
                  lastMsgSender.innerHTML
                );

                if (lastMsgSender.innerHTML !== "You sent" && role === "row") {
                  const messages_table = node.querySelector(
                    '[data-scope="messages_table"]'
                  );

                  console.log("Bargaining", "messages_table", messages_table);
                  const messages =
                    messages_table.querySelectorAll('[dir="auto"]')[1]
                      .innerHTML;
                  console.log("Bargaining", "messages", messages);
                  prevMsgCount = wrapper?.childElementCount;
                  await window.receiveMessage(messages);
                }
              });
            }
          }
        });

        // 开始观察聊天记录窗口的变化
        observer.observe(chatWindow, { childList: true, subtree: true });
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
