const mongoose = require('mongoose');

/**
 * Post Schema
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
}, {
  timestamps: true,
});

// Declare index for createdAt property
postSchema.index({ createdAt: -1 });

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', postSchema);
