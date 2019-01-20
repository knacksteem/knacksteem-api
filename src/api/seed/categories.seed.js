const Category = require('../models/category.model');

// Batch of initial categories
const initialCategories = [
  { key: 'gaming', name: 'Gaming' },
  { key: 'documentary', name: 'Documentary' },
  { key: 'art', name: 'Art' },
  { key: 'altruism', name: 'Altruism' },
  { key: 'techtrends', name: 'Tech trends' },
  { key: 'humor', name: 'Joke/Humor' },
  { key: 'music', name: 'Music' },
  { key: 'diy', name: 'DIY' },
  { key: 'fashion', name: 'Fashion' },
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
