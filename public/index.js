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
      this.ws.onmessage = (message) => {
        this.chats = JSON.parse(message.data).chats;
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      }
    };
  },

  methods: {
    // Get the name inputted from our modal window
    receiveName: function(name) {
      this.pendingUserName = name;
      this.ws.send(name);
      this.ws.onmessage = this.nameRequestHandler;
    },

    nameRequestHandler: function (message) {
      var data = JSON.parse(message.data);

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

    handleMessage: function(message) {
      var data = JSON.parse(message.data);
      // console.log('Message received');
      this.chats.push(data);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    },

    handleUsersList: function(message) {
      var data = JSON.parse(message.data);
      this.users = data.users;
    },

    masterHandler: function(message) {
      var type = JSON.parse(message.data).type;
      
      switch (type) {
        case "chat":
          this.handleMessage(message);
          break;
        case "usersList":
          this.handleUsersList(message);
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