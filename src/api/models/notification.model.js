const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp-date-unix');

mongoose.set('useCreateIndex', true);

/**
 * Notification Schema
 * @author Jayser Mendez
 * @private
 */
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  read: {
    type: String,
    required: true,
    trim: true,
    default: false,
  },
  metadata: {
    type: Object,
    required: false,
    default: {},
  },
});

// Declare index in notification schema for faster query.
notificationSchema.index({
  createdAt: -1,
  to: 1,
}, { name: 'notification_index' });

// Convert date to timestamps
notificationSchema.plugin(timestamps);

/**
 * @typedef Notification
 */
module.exports = mongoose.model('Notification', notificationSchema);
