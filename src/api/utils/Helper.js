/**
 * Method to validate vote
 * @param {Number} array 
 * @param {String} username 
 */
exports.isVoted = (array, username) => {
  for (let vote of array) {
    if (vote.voter === username) {
      return true;
    }
  }
  return false;
}

/**
 * Method to generate JSON for error
 * @param {Number} code 
 * @param {String} msg 
 * @param {String} type
 */
exports.ReturnError = (code, msg, type) => {
  return {
      status: code,
      message: msg,
      type: type
  }
}