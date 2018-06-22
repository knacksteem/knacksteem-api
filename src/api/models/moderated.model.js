const mongoose = require('mongoose');

/**
 * Moderated Posts Schema
 * @author Jayser Mendez
 * @private
 */
const moderatedSchema = new mongoose.Schema({
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
    required: true,
    trim: true,
    lowercase: true,
  },
  moderatedAt: {
    type: Date,
    default: null,
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
}, {
  timestamps: true,
});

// Declare index for createdAt property.
moderatedSchema.index({ createdAt: -1 });

// Declare index for author and category.
moderatedSchema.index({ moderatedBy: 1, approved: 1, permlink: 1 });

/**
 * @typedef ModeratedPost
 */
module.exports = mongoose.model('ModeratedPost', moderatedSchema);
