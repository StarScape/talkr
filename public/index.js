window.onload = function() {

var vm = new Vue({
  el: "#app",
  data: {
    currentChat: "",
    chats: [],
    id: null
  },

  mounted: function() {
    this.ws = new WebSocket("ws://127.0.0.1:8080");
    
    // Shake hands    
    this.ws.onmessage = (message) => {
      var data = JSON.parse(message.data);
      this.id = data.id;
      this.chats = data.chats;

      // Handshake complete, handle messages normally
      this.ws.onmessage = this.handleMessage;
    }
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