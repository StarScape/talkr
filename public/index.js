window.onload = function() {

window.vm = new Vue({
  el: "#app",
  data: {
    currentChat: "",
    chats: [],
    pendingUserName: "",
    userName: "",
    checkingUsername: true,
    usernamePrompt: "Please enter username"
  },

  mounted: function() {
    // var name = "";
    this.ws = new WebSocket("ws://127.0.0.1:8080");
    
    this.ws.onopen = (e) => {
      this.ws.onmessage = (message) => {
        this.chats = JSON.parse(message.data).chats;
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
        this.ws.onmessage = this.handleMessage;
        this.checkingUsername = false;
      }
      else {
        this.usernamePrompt = `'${this.pendingUserName}' is taken, try again.`
      }
    },

    handleMessage: function(message) {
      var data = JSON.parse(message.data);
      this.chats.push(data);
    },

    sendChat: function(e) {
      this.ws.send(JSON.stringify({
        date: Date.now(),
        text: this.currentChat
      }));
    },

    displayDate: function(date) {
      var d = new Date(date);
      return `${d.getHours()}:${d.getMinutes()}`
    },
  }
});

}