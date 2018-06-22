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
 * Method to construct query based on parameters from the URL
 * @param {Object} req: url params
 * @private
 * @returns a ternary operator with the query for MongoDB
 * @author Jayser Mendez.
 */
const constructQuery = (req) => {
  /**
   * Ternary conditions to decide which query to load.
   */
  const authorCondition = (req.query.author);
  const authorQuery = { author: req.query.author };
  const categoryCondition = (req.query.category);
  const categoryQuery = { category: req.query.category };
  const bothConditions = (authorCondition && categoryCondition);
  const bothQuery = { author: req.query.author, category: req.query.category };

  /**
   * If the author and category are present in the query, query by author and category.
   * Else if the author is present in the query, query the posts by author.
   * Else if the category is present in the query, query the posts by category.
   * Else, query all posts
   */
  // eslint-disable-next-line
  return bothConditions ? bothQuery : (authorCondition ? authorQuery : (categoryCondition ? categoryQuery : {}));
};

/**
 * Get posts from database based on criteria and sorting.
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.getPosts = async (req, res, next) => {
  try {
    // Query the posts from database in a descending order.
    let { limit, skip } = req.query;
    const sort = { createdAt: -1 };

    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);

    /**
     * Construct the query based on the parameters given.
     */
    const query = constructQuery(req);

    // Query the posts from database given the query.
    const postsList = await Post.find(query).sort(sort).limit(limit || 25).skip(skip || 0);

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
        category: response.category,
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
