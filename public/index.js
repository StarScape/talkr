window.onload = function() {

window.vm = new Vue({
  el: "#app",
  data: {
    currentChat: "",
    chats: [],
    users: ["Jack", "James", "John"],
    pendingUserName: "",
    userName: "",
    checkingUsername: true,
    usernamePrompt: "Enter username"
  },

  mounted: function() {
    this.chatContainer = this.$el.querySelector('#chat-container');
    this.ws = new WebSocket("ws://127.0.0.1:8080");
    
    this.ws.onopen = (e) => {
      this.ws.onmessage = this.masterHandler;
    };
  },

  methods: {
    // Get the name inputted from our modal window
    submitName: function(name) {
      this.pendingUserName = name;
      this.ws.send(JSON.stringify({
        type: "nameRequest",
        name: name
      }));
      // this.ws.onmessage = this.nameRequestHandler;
    },

    // The server sends down the existing chats first
    initialDataHandler: function(data) {
      this.chats = data.chats;
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    },

    nameRequestHandler: function (data) {
      if (data.nameGranted) {
        console.log("Username granted.");
        this.userName = this.pendingUserName;

        // Handle messages normally from now on
        this.ws.onmessage = this.masterHandler;
        this.checkingUsername = false;
      }
      else {
        this.usernamePrompt = `'${this.pendingUserName}' is taken, try again.`
      }
    },

    messageHandler: function(data) {
      this.chats.push(data);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    },

    usersListHandler: function(data) {
      this.users = data.users;
    },

    masterHandler: function(message) {
      var data = JSON.parse(message.data);
      
      switch (data.type) {
        case "initialData":
          this.initialDataHandler(data);
          break;
        case "chat":
          this.messageHandler(data);
          break;
        case "nameReqStatus":
          this.nameRequestHandler(data);
          break;
        case "usersList":
          this.usersListHandler(data);
          break;
      }
    },

    sendChat: function(e) {
      this.ws.send(JSON.stringify({
        date: Date.now(),
        text: this.currentChat
      }));

      this.currentChat = "";
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    },

    displayDate: function(date) {
      var d = new Date(date);
      return d;
    },
  }
});

}