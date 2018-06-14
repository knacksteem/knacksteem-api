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
      tags: res.body.tags,
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
