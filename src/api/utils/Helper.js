/**
 * Method to validate vote. 
 * @param {Number} array 
 * @param {String} user 
 * @description It will return true if the user has voted, otherwise it will return false.
 * @returns boolean (is voted or not)
 */
exports.isVoted = (array, user) => {
  for (let vote of array) {
    if (vote.voter === user) {
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