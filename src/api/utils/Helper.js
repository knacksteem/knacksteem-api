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
 * Insert notification in database and return notification object
 * @param {String} type: type of the notification
 * @param {String} to: recipient of the notification
 * @param {Object} metadata: metadata of the notification
 */
exports.generateNotification = async (type, to, metadata = {}) => {
  try {
    const notificationObj = {
      type,
      to,
      read: false,
      metadata,
    };
    const notification = new Notification(notificationObj);

    const dbNotification = await Notification.create(notification);

    if (dbNotification) {
      notificationObj._id = dbNotification._id;
      notificationObj.createdAt = dbNotification.createdAt;
      return notificationObj;
    }

    return null;
  } catch (err) {
    return null;
  }
};
