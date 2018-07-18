const Category = require('../models/category.model');

// Batch of initial categories
const initialCategories = [
  { key: 'vlog', name: 'VLog' },
  { key: 'graphics', name: 'Graphics' },
  { key: 'art', name: 'Art' },
  { key: 'knack', name: 'Knack' },
  { key: 'onealtruism', name: 'One Altruism' },
  { key: 'music', name: 'Music' },
  { key: 'humor', name: 'Joke/Humor' },
  { key: 'inspiring', name: 'Inspiring' },
  { key: 'visibility', name: 'Visibility' },
  { key: 'news', name: 'News' },
  { key: 'quotes', name: 'Quotes' },
  { key: 'techtrends', name: 'Tech Trends' },
  { key: 'blogposts', name: 'Blog Posts' },
];

/**
 * Method to insert the initial batch of categories in the backend
 * @public
 * @author Jayser Mendez
 */
exports.seedCategories = async () => {
  try {
    const count = await Category.count();
    // If this is the first time running, insert the categories
    if (count === 0) {
      initialCategories.map(async (category) => {
        const newCategory = await new Category({
          key: category.key,
          name: category.name,
        });
        await Category.create(newCategory);
      });

      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
