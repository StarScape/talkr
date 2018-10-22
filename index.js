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
var chats = [
  {id: 1, text: "example1"},
  {id: 2, text: "example2"}
];

wss.on('connection', ws => {
  ws.on('message', function (message) {
    var data = JSON.parse(message);
    chats.push(data);

    // Broadcast the chat to all users
    wss.broadcast(message);
  });
  
  // Send initial data
  ws.send(JSON.stringify({
    id: Math.floor(Math.random() * 100),
    chats: chats
  }));
});

wss.broadcast = function(message) {
  wss.clients.forEach(function(client) {
    client.send(message);
  })
};