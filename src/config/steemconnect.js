const sc2 = require('steemconnect');
const config = require('./vars');

const api = sc2.Initialize({
  app: config.sc2_app, // SC2 App identifier here
  callbackURL: config.sc2_callback, // not really needed
});

module.exports = api;
