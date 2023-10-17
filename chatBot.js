const axios = require("axios");

class ChatBot {
  constructor(page) {
    this.conversations = new Map();
    this.page = page;
  }

  async createConversation(data) {
    console.log("Create conversation with data:", data);
    try {
      const response = await axios.post(
        "https://aidc-appsmith.alibaba-inc.com/bargain4/create",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { uuid: conversationId, m: initialMessage } = response.data;
      console.log("Session Id:", conversationId);
      const conversation = { Seller: [], Buyer: [initialMessage] };
      this.conversations.set(conversationId, conversation);
      this.sendMessage(conversationId, initialMessage);
      return conversationId;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  }

  async closeConversation(conversationId) {
    const url = `https://aidc-appsmith.alibaba-inc.com/bargain4/close?uuid=${conversationId}`;
    try {
      const response = await axios.get(url);
      if (response.status === 200 && response.data === "success") {
        console.log("Close conversation:", conversationId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  async receiveMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found!");
    }
    const data = {
      c: message,
      uuid: conversationId,
    };

    console.log("Receive message:", message);

    try {
      const response = await axios.post(
        "https://aidc-appsmith.alibaba-inc.com/bargain4/talk",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { m: nextMessage, c: chattingRecords } = response.data;
      this.saveChatMessages(conversationId, chattingRecords);
      this.sendMessage(conversationId, nextMessage);
    } catch (error) {
      console.error("Failed to receive message:", error);
      throw error;
    }
  }

  async sendMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found!");
    }

    console.log("conversation", conversation);

    await this.page.keyboard.type(message);
    await this.page.keyboard.press("Enter");
  }

  saveChatMessages(conversationId, chattingRecords) {
    if (chattingRecords && Array.isArray(chattingRecords)) {
      const newConversation = { Seller: [], Buyer: [] };
      chattingRecords.forEach((message) => {
        const sender = message.split(" : ")[0].trim();
        const text = message.split(" : ")[1].trim();
        newConversation[sender].push(text);
      });
      this.conversations.set(conversationId, newConversation);
    }
  }
}

module.exports = ChatBot;
