const Post = require('../models/post.model');
const async = require('async');
const request = require('request-promise-native');
const helper = require('../utils/Helper');
const client = require('../utils/SteemAPI');
const steem = require('steem');
const httpStatus = require('http-status');

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
      tags: req.body.tags,
    });

    // Insert the post into database.
    await Post.create(newPost);

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
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.getPosts = async (req, res, next) => {
  try {
    // Query the posts from database in a descending order.
    const { username } = req.query;
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

      let isVoted = false;

      // Check if there is a user provided in the params.
      // If so, determine if this user has voted the post.
      if (username) {
        isVoted = helper.isVoted(response.active_votes, username);
      }

      // Parse only the fields needed.
      // TODO: Determine what fields we need
      return {
        title: response.title,
        description: response.body,
        category: response.category,
        isVoted,
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
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to get a single post from Steem Blockchain
 * @param {*} req
 * @param {*} res
 * @author Huseyin Terkir (hsynterkr)
 * @returns an object with the post from Steem Blockchain
 * @public
 */
exports.getSinglePost = async (req, res, next) => {
  try {
    // Grab the parameters from the param
    const { author, permlink } = req.params;
    const { username } = req.query;

    // Call the get_content RPC method of Steem API to grab post data
    const post = await client.sendAsync('get_content', [author, permlink]);

    // If there are not results from this post, let the client know.
    if (!post.author || !post.permlink) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Parse the JSON metadata of the post since it is not parsed by default.
    post.json_metadata = JSON.parse(post.json_metadata);

    // Get body image of the post.
    // eslint-disable-next-line
    post.image = post.json_metadata.image[0];

    // Use steem formatter to format reputation
    post.author_reputation = steem.formatter.reputation(post.author_reputation);

    // Calculate total payout for vote values
    const totalPayout = parseFloat(post.pending_payout_value) +
                        parseFloat(post.total_payout_value) +
                        parseFloat(post.curator_payout_value);

    // Get the votes weight as percentage.
    // eslint-disable-next-line
    for (let i in post.beneficiaries) {
      // eslint-disable-next-line
      post.beneficiaries[i].weight = (post.beneficiaries[i].weight) / 100;
    }

    // Calculate recent voteRshares and ratio values.
    const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    const ratio = totalPayout / voteRshares;

    // Calculate exact values of votes
    // eslint-disable-next-line
    for (let i in post.active_votes) {
      post.active_votes[i].value = (post.active_votes[i].rshares * ratio).toFixed(2);
      post.active_votes[i].reputation = steem.formatter.reputation(post.active_votes[i].reputation);
      // eslint-disable-next-line
      post.active_votes[i].percent = post.active_votes[i].percent / 100;
      post.active_votes[i].profile_image = `https://steemitimages.com/u/${post.active_votes[i].voter}/avatar/small`;
    }

    // Sort votes by vote value
    const activeVotes = post.active_votes.slice(0);
    activeVotes.sort((a, b) => b.value - a.value);

    let isVoted = false;

    // Check if the post is voted by the provided user
    if (username) {
      isVoted = helper.isVoted(post.active_votes, username);
    }

    // eslint-disable-next-line
    post['isVoted'] = isVoted;

    // Send the results to the client
    return res.send(post);

  // Catch any possible error.
  } catch (err) {
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
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

  // Query to get posts by author
  const authorCondition = (req.query.author);
  const authorQuery = { author: req.query.author };

  // Query to get posts by category
  const categoryCondition = (req.query.category);
  const categoryQuery = { category: req.query.category };

  // Query for full text search using title and description fields.
  const searchCondition = (req.query.search);
  const searchQuery = {
    $or: [{ title: { $regex: req.query.search, $options: 'i' } },
      { permlink: { $regex: req.query.search, $options: 'i' } }],
  };

  // Query with all the options together
  const allConditions = (authorCondition && categoryCondition && searchCondition);
  const allQuery = {
    author: req.query.author,
    category: req.query.category,
    $or: [{ category: { $regex: req.query.search, $options: 'i' } },
      { permlink: { $regex: req.query.search, $options: 'i' } }],
  };

  /**
   * If the author,category, and search are present in the query, query by author and category
   * using full text search.
   * Else if the author is present in the query, query the posts by author.
   * Else if the category is present in the query, query the posts by category.
   * Else if the search is present in the query, do a full text search
   * Else, query all posts
   */
  // eslint-disable-next-line
  return allConditions ? allQuery : (authorCondition ? authorQuery : (categoryCondition ? categoryQuery : (searchCondition ? searchQuery : {})));
};
