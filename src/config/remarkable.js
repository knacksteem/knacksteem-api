const Remarkable = require('remarkable');

// Remarkable configuration
module.exports = new Remarkable({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
});
