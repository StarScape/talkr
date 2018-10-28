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

  // Is desired username taken?
  function initialHandler(message) {
    var data = JSON.parse(message);

    if (users.includes(data.name)) {
      ws.send(JSON.stringify({
        type: "nameReqStatus",
        nameGranted: false
      }));
    }
    else {
      ws.send(JSON.stringify({
        type: "nameReqStatus",
        nameGranted: true,
        chats: chats
      }));
      ws.userName = data.name;
      users.push(data.name);
      handshakeOver = true;

      // Send out list of active users periodically
      broadcastUserList();
      console.log(`User connected: ${ws.userName}`);
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
    type: 'initialData',
    chats: chats
  }));
});

wss.broadcastChat = function(chat) {
  wss.clients.forEach(function(client) {
    client.send(JSON.stringify(chat));
  });
};