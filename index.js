var express = require('express');
var path = require('path');
var WebSocket = require('ws');

// HTTP server
var app = express();
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(80);
console.log("Listening on port 80...");

// Websockets server
var wss = new WebSocket.Server({ port: 8080 });
var users = ["admin"];
var chats = [
  {userName: "admin", text: "Welcome to chat!"},
];

wss.on('connection', ws => {
  var handshakeOver = false;


  // Is desired username taken?
  function initialHandler(message) {
    if (users.includes(message)) {
      ws.send(JSON.stringify({
        nameGranted: false
      }));
    }
    else {
      ws.send(JSON.stringify({
        nameGranted: true,
        chats: chats
      }));
      ws.userName = message;
      users.push(message);
      handshakeOver = true;

      // Send out list of active users periodically
      broadcastUserList();
      console.log(`User connected: ${ws.userName}`);
    }
  }

  function broadcastUserList() {
    if (ws.readyState == 1) {
      ws.send(JSON.stringify({
        type: "usersList",
        users: users.filter((name) => name != "admin")
      }));

      // Broadcast updated user list periodically
      setTimeout(broadcastUserList, 10000);
    }
  }

  function normalHandler(message) {
    var chat = JSON.parse(message);
    chat['userName'] = ws.userName;
    chats.push(chat);
    chat['type'] = 'chat';

    // Broadcast the chat to all users
    wss.broadcastChat(chat);
  }

  ws.on('message', function (message) {
    if (handshakeOver) {
      normalHandler(message);
    }
    else {
      initialHandler(message);
    }
  });
  
  // Send initial data
  ws.send(JSON.stringify({
    chats: chats
  }));
});

wss.broadcastChat = function(chat) {
  wss.clients.forEach(function(client) {
    client.send(JSON.stringify(chat));
  });
};