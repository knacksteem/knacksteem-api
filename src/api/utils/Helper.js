/**
 * Method to validate vote.
 * @param {Number} array
 * @param {String} user
 * @description It will return true if the user has voted, otherwise it will return false.
 * @returns boolean (is voted or not)
 */
exports.isVoted = (array, user) => {
  // eslint-disable-next-line
  for (let vote of array) {
    if (vote.voter === user) {
      return true;
    }
  }
  return false;
};
