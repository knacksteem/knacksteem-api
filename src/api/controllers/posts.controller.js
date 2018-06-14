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
 * Get all posts from database
 * @author Jayser Mendez
 * @public
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    // Query the posts from database in a descending order.
    const postsList = await Post.find().sort({ createdAt: -1 });

    // Send the posts to the client in a formatted JSON.
    return res.send({
      results: postsList,
      count: postsList.length,
      status: 200,
    });

  // Catch any possible error
  } catch (err) {
    return next(err);
  }
};
