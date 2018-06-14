const mongoose = require('mongoose');

/**
 * Post Schema
 * @private
 */
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: false,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', postSchema);
