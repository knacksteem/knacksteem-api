const mongoose = require('mongoose');

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
  },
}, {
  timestamps: true,
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

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', postSchema);
