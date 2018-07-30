const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const https = require('https');
const fs = require('fs');

// open mongoose connection
mongoose.connect();
let options;
if (env === 'production') {
  options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
  };
}

// listen to requests
if (env === 'production') {
  https.createServer(options, app).listen(port);
} else {
  app.listen(port, () => console.info(`server started on port ${port} (${env})`));
}

/**
* Exports express
* @public
*/
module.exports = app;
