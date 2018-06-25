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
      default: null,
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

// Declare index for createdAt property.
postSchema.index({ createdAt: -1 });

// Declare index for author and category.
postSchema.index({ author: 1, category: 1 });

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', postSchema);
