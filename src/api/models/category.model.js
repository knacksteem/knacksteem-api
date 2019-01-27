const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

/**
 * Category Schema
 * @author Jayser Mendez
 * @private
 */
const categorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  name: {
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

// Declare index in category schema for faster query.
categorySchema.index({
  key: 1,
  name: 1,
}, { name: 'category_index' });

/**
 * @typedef Category
 */
module.exports = mongoose.model('Category', categorySchema);
