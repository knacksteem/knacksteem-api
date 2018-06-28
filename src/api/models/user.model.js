const mongoose = require('mongoose');

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  roles: {
    type: Array,
    default: ['contributor'],
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  bannedUntil: {
    type: Number,
    default: null,
  },
  banReason: {
    type: String,
    default: null,
  },
  bannedBy: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Declare index in user schema for faster query.
userSchema.index({
  isBanned: 1,
  bannedBy: 1,
  roles: 1,
}, { name: 'user_index' });

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
