const Post = require('../models/post.model');
const async = require('async');
const request = require('request-promise-native');
const helper = require('../utils/Helper')
const client = require('../utils/SteemAPI')
const steem = require('steem');

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

/**
 * Method to get a single post from Steem Blockchain
 * @param {*} req 
 * @param {*} res 
 * @author Huseyin Terkir (hsynterkr)
 * @returns an object with the post from Steem Blockchain
 * @public
 */
exports.getSinglePost = (req, res, next) => {

  let author = req.params.author;
  let permlink = req.params.permlink;

  if (author === null || author === undefined || author === '') {
    return next(helper.ReturnError(500, 'Required parameter "author" is missing.', 'Internal'));
  } else if (permlink === null || permlink === undefined || permlink === '') {
    return next(helper.ReturnError(500, 'Required parameter "permlink" is missing.', 'Internal'));
  }

  client.sendAsync('get_content', [author, permlink]).then(post => {
    if (!post.author || !post.permlink) {
      return next(helper.ReturnError(404, 'Required parameter "permlink" or "author" is wrong!', 'Not Found'));
    }
    post.json_metadata = JSON.parse(post.json_metadata);

    // Get body image of the post.
    post.image = post.json_metadata.image[0];

    // Use steem formatter to format reputation 
    post.author_reputation = steem.formatter.reputation(post.author_reputation);

    // Calculate total payout for vote values
    let totalPayout =
    parseFloat(post.pending_payout_value) +
    parseFloat(post.total_payout_value) +
    parseFloat(post.curator_payout_value);

    for(i in post.beneficiaries) {
      post.beneficiaries[i].weight = (post.beneficiaries[i].weight)/100
    }

    // Calculate recent voteRshares and ratio values.
    let voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    let ratio = totalPayout / voteRshares;
    
    // Calculate exact values of votes
    for(i in post.active_votes) {
      post.active_votes[i].value = (post.active_votes[i].rshares * ratio).toFixed(2);
      post.active_votes[i].reputation = steem.formatter.reputation(post.active_votes[i].reputation);
      post.active_votes[i].percent = post.active_votes[i].percent / 100;
      post.active_votes[i].profile_image = 'https://steemitimages.com/u/' + post.active_votes[i].voter + '/avatar/small'
    }

    // Sort votes by vote value
    let active_votes = post.active_votes.slice(0);
    active_votes.sort((a,b) => {
      return b.value - a.value
    })

    return res.json(post);

  }).catch(err => console.log(err));
};