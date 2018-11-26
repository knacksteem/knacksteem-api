const Notification = require('../models/notification.model');
const httpStatus = require('http-status');

/**
 * Return notifications from the specified user
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { username } = res.locals;

    const notifications = await Notification.find({ to: username });

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      results: notifications,
      count: notifications.length,
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
