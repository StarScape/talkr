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
var takenNames = ["Admin"];
var chats = [
  {userName: "admin", text: "Welcome to chat!"},
];

wss.on('connection', ws => {
  var handshakeOver = false;

  // Is desired username taken?
  function initialHandler(message) {
    if (takenNames.includes(message)) {
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
      takenNames.push(message);
      handshakeOver = true;

      console.log(`User connected: ${ws.userName}`);
    }
  }

  function normalHandler(message) {
    var data = { userName: ws.userName, text: message };
    chats.push(data);

    // Broadcast the chat to all users
    wss.broadcast(JSON.stringify(data));
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
  // var id = Math.floor(Math.random() * 100);
  // ws.userID = id;
  ws.send(JSON.stringify({
    chats: chats
  }));
});

wss.broadcast = function(message) {
  wss.clients.forEach(function(client) {
    client.send(message);
  })
};