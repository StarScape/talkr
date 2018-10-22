window.onload = function() {

window.vm = new Vue({
  el: "#app",
  data: {
    currentChat: "",
    chats: [],
    userName: ""
  },

  mounted: function() {
    var name = prompt("Enter username:");
    this.ws = new WebSocket("ws://127.0.0.1:8080");
    
    this.ws.onopen = (e) => {
      // Ask server to use username
      this.ws.send(name);
      
      // See if they let us
      this.ws.onmessage = (message) => {
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
    };
  },

  methods: {
    sendChat: function(e) {
      this.ws.send(this.currentChat);
    },

    handleMessage: function(message) {
      var data = JSON.parse(message.data);
      console.log(data);
      this.chats.push(data);
    }
  }
});

}