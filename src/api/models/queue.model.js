const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp-date-unix');

/**
 * BotQueue Schema
 * @author Jayser Mendez
 * @private
 */
const queueSchema = new mongoose.Schema({
  permalink: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  weight: {
    type: Number,
    required: true,
    trim: true,
  },
});

// Declare index in bot queue schema for faster query.
queueSchema.index({
  permlink: 1,
  author: 1,
}, { name: 'botQueue_index' });

// Convert date to timestamps
queueSchema.plugin(timestamps);

/**
 * @typedef Category
 */
module.exports = mongoose.model('BotQueue', queueSchema);
