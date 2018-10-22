window.onload = function() {

window.vm = new Vue({
  el: "#app",
  data: {
    currentChat: "",
    chats: [],
    userName: ""
  },

  mounted: function() {
    var name = "";
    this.ws = new WebSocket("ws://127.0.0.1:8080");
    
    this.ws.onopen = (e) => {
      this.ws.onmessage = (message) => {
        this.chats = JSON.parse(message.data).chats;
        name = prompt("Enter username:");

        // Ask server for username
        this.ws.send(name);
        this.ws.onmessage = nameRequestHandler;
      }
    };

    // See if server gives us username
    var nameRequestHandler = (message) => {
      console.log(message);
      var data = JSON.parse(message.data);

      if (data.nameGranted) {
        console.log("Username granted.");
        this.userName = name;
        this.chats = data.chats;

        // Handle messages normally from now on
        this.ws.onmessage = this.handleMessage;
      }
      else {
        name = prompt("Username taken, enter new username:");
        this.ws.send(name);
      }
    }
  },

  methods: {
    sendChat: function(e) {
      this.ws.send(JSON.stringify({
        date: Date.now(),
        text: this.currentChat
      }));
    },

    handleMessage: function(message) {
      var data = JSON.parse(message.data);
      console.log(data);
      this.chats.push(data);
    },

    displayDate: function(date) {
      var d = new Date(date);
      return `${d.getHours()}:${d.getMinutes()}`
    }
  }
});

}