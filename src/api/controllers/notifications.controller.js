const Notification = require('../models/notification.model');
const httpStatus = require('http-status');

/**
 * Returns notifications from the specified user
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { username } = res.locals;

    let { limit, skip } = req.body;

    if (!limit) { limit = 25; }
    if (!skip) { skip = 0; }

    const notifications = await Notification.find({ to: username }).limit(limit).skip(skip);

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

/**
 * Marks a notification as read
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.readNotification = async (req, res, next) => {
  try {
    const { username } = res.locals;
    const { id } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { id, to: username },
      {
        $set: {
          read: true,
        },
      },
    );

    if (notification) {
      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        message: 'Notification correctly read.',
      });
    }

    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'Notification cannot be found.',
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
