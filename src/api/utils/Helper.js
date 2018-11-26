const Notification = require('../models/notification.model');

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

/**
 * Generates a notification object
 * @param {String} type: type of the notification
 * @param {String} to: recipient of the notification
 * @param {Object} metadata: metadata of the notification
 */
exports.generateNotification = (type, to, metadata = {}) => {
  const notification = new Notification({
    type,
    to,
    read: false,
    metadata,
  });

  return notification;
};
