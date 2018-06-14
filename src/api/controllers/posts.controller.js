const Post = require('../models/post.model');

/**
 * Insert a new post into database
 * @author Jayser Mendez
 * @public
 */
exports.createPost = async (req, res, next) => {
  try {
    // Initialize a new object with post data
    const newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      author: res.locals.username,
      tags: req.body.tags || [],
    });

    // Insert the post into database.
    Post.create(newPost);

    res.send({
      status: 200,
      message: 'Post created correctly',
    });

    // Move to the next middleware
    return next();

  // If any error, catch it
  } catch (error) {
    return next(error);
  }
};

/**
 * Get posts from database based on criteria and sorting.
 * @param {Object} criteria: Fields to project from database
 * @param {Object} sort: Sorting strategy
 * @param {Number} limit: how much posts will be pulled
 * @param {Number} skip: how much posts will be skiped (useful for pagination)
 * @author Jayser Mendez
 * @private
 * @returns an array with the posts from database response
 */
const getPosts = async (criteria, sort, limit, skip) => {
  try {
    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);
    const postsList = await Post.find(criteria).sort(sort).limit(limit || 25).skip(skip || 0);
    return {
      results: postsList,
      count: postsList.length,
      status: 200,
    };
  } catch (err) {
    return err;
  }
};

/**
 * Get all posts from database
 * @author Jayser Mendez
 * @public
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    // Query the posts from database in a descending order.
    const { limit, skip } = req.query;
    const sort = { createdAt: -1 };
    const postsList = await getPosts({}, sort, limit, skip);

    // Send the posts to the client in a formatted JSON.
    return res.send(postsList);

  // Catch any possible error
  } catch (err) {
    return next(err);
  }
};

/**
 * Get all from a specific user from database
 * @author Jayser Mendez
 * @public
 */
exports.getPostsByAuthor = async (req, res, next) => {
  try {
    // Query the posts from database in a descending order.
    const { limit, skip } = req.query;
    const author = { author: req.query.username };
    const sort = { createdAt: -1 };
    const postsList = await getPosts(author, sort, limit, skip);

    // Send the posts to the client in a formatted JSON.
    return res.send(postsList);

  // Catch any possible error
  } catch (err) {
    return next(err);
  }
};
