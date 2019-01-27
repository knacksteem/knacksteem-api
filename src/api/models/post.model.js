const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp-date-unix');

mongoose.set('useCreateIndex', true);

/**
 * Post Schema
 * @author Jayser Mendez
 * @private
 */
const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  permlink: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  tags: {
    type: Array,
    required: true,
    default: [],
  },
  moderation: {
    reserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      type: String,
      default: null,
    },
    reservedUntil: {
      type: Number,
      default: 0,
    },
    moderated: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: String,
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
});

// Declare index in post schema for faster query.
postSchema.index({
  createdAt: -1,
  author: 1,
  category: 1,
  permlink: 1,
  'moderation.reservedBy': 1,
  'moderation.moderatedBy': 1,
  'moderation.reserved': 1,
  'moderation.approved': 1,
  'moderation.moderated': 1,
}, { name: 'post_index' });

// Convert date to timestamps
postSchema.plugin(timestamps);

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', postSchema);
