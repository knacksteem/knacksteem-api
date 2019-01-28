const Category = require('../models/category.model');
const logger = require('../../config/logger');

// Batch of initial categories
const initialCategories = [
  { key: 'gaming', name: 'Gaming', scoreCap: 20 },
  { key: 'documentary', name: 'Documentary', scoreCap: 40 },
  { key: 'art', name: 'Art', scoreCap: 40 },
  { key: 'altruism', name: 'Altruism', scoreCap: 25 },
  { key: 'techtrends', name: 'Tech trends', scoreCap: 30 },
  { key: 'humor', name: 'Joke/Humor', scoreCap: 20 },
  { key: 'music', name: 'Music', scoreCap: 45 },
  { key: 'diy', name: 'DIY', scoreCap: 50 },
  { key: 'fashion', name: 'Fashion', scoreCap: 35 },
];

/**
 * Method to insert the initial batch of categories in the backend
 * @public
 * @author Jayser Mendez
 */
exports.seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    // If this is the first time running, insert the categories
    if (count === 0) {
      initialCategories.map(async (category) => {
        const newCategory = await new Category({
          key: category.key,
          name: category.name,
          scoreCap: category.scoreCap,
        });
        await Category.create(newCategory);
      });

      return true;
    }
    return false;
  } catch (err) {
    logger.error(err);
    return false;
  }
};
