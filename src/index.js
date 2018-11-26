const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');
const sc2 = require('./config/steemconnect');

// open mongoose connection
mongoose.connect();

let options;
let server;

// listen to requests
if (env === 'production') {
  options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
  };
  server = https.createServer(options, app);
  server.listen(port);
} else {
  server = app.listen(port, () => console.info(`server started on port ${port} (${env})`));
}

// Initialize Socket Server over the same port
const io = new SocketIO(server);

// Setup auth middleware for sockets server
io.use(async (socket, next) => {
  try {
    if (socket.handshake.query && socket.handshake.query.token) {
      // Set the access token to the sc2 instance
      sc2.setAccessToken(socket.handshake.query.token);

      // Call the sc2 api to validate the token.
      const sc2Res = await sc2.me();

      // Create a join a room with the username of the logged in user.
      socket.join(sc2Res.user);

      next();
    } else {
      next(new Error('Authentication error'));
    }
  } catch (err) {
    console.log('got here first');
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  // Connection is authenticated.
  // Notify the client that the connection is established.
  io.to(socket.id).emit('message', 'sucessfully connected to server.');
});

// Save a reference of the socket instance for later use
// USE: req.app.get('socketio');
app.set('socketio', io);

/**
* Exports express
* @public
*/
module.exports = app;
