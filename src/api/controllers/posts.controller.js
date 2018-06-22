const Post = require('../models/post.model');
const async = require('async');
const request = require('request-promise-native');

/**
 * Insert a new post into database
 * @author Jayser Mendez
 * @public
 */
exports.createPost = async (req, res, next) => {
  try {
    // Initialize a new object with post data
    const newPost = new Post({
      permlink: req.body.permlink,
      author: res.locals.username,
      category: req.body.category,
    });

    // Insert the post into database.
    Post.create(newPost);

    return res.send({
      status: 200,
      message: 'Post created correctly',
    });

    // If any error, catch it
  } catch (error) {
    return next(error);
  }
};

/**
 * Get posts from database based on criteria and sorting.
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @param {Object} criteria: Fields to project from database
 * @param {Object} sort: Sorting strategy
 * @param {Number} limit: how much posts will be pulled
 * @param {Number} skip: how much posts will be skiped (useful for pagination)
 * @author Jayser Mendez
 * @private
 * @returns an array with the posts from steem API response
 */
const getPosts = async (res, next, criteria, sort, limit, skip) => {
  try {
    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);
    const postsList = await Post.find(criteria).sort(sort).limit(limit || 25).skip(skip || 0);

    // Declare an array to hold the URLS to do the http GET call.
    const urls = [];

    // Iterate over the results from the database to generate the urls.
    postsList.forEach((post) => {
      urls.push(`https://api.steemjs.com/get_content?author=${post.author}&permlink=${post.permlink}`);
    });

    // Do all the http calls and grab the results at the end. it will do 15 parallel calls.
    async.mapLimit(urls, 15, async (url) => {
      // Fetch the http GET call results
      const response = await request({ url, json: true });

      // Parse only the fields needed.
      // TODO: Determine what fields we need
      return {
        title: response.title,
        description: response.body,
      };

    // Grab results or catch errors
    }, (err, results) => {
      // If there is any error, send it to the client.
      if (err) return next(err);

      // Send the results to the client in a formatted JSON.
      res.send({
        results,
        count: results.length,
      });

      return true;
    });

    return true;

  // Catch any possible error
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

    // eslint-disable-next-line
    const postsList = await getPosts(res, next, {}, sort, limit, skip);

    return true;

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
    const author = { author: req.query.author };
    const sort = { createdAt: -1 };

    // eslint-disable-next-line
    const postsList = await getPosts(res, next, author, sort, limit, skip);

    return true;

    // Catch any possible error
  } catch (err) {
    return next(err);
  }
};
