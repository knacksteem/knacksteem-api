const Post = require('../models/post.model');
const async = require('async');
const request = require('request-promise-native');
const helper = require('../utils/Helper');
const client = require('../utils/SteemAPI');
const steem = require('steem');
const httpStatus = require('http-status');
const striptags = require('striptags');
const Promise = require('bluebird');
const md = require('../../config/remarkable');

/**
 * Insert a new post into database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
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

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: 'Post created correctly',
    });

    // If any error, catch it
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to update the tags of a post
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Jayser Mendez
 * @public
 */
exports.updateTags = async (req, res, next) => {
  try {
    const { permlink, tags } = req.body;
    const { username } = res.locals;

    const post = await Post.findOne({ permlink });

    if (post.author !== username) {
      return next({
        status: httpStatus.UNAUTHORIZED,
        message: 'You cannot edit someone else post',
      });
    }

    await Post.updateOne({ permlink }, { tags });

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: 'Post edited correctly',
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
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

    // Hold the primary category of each post
    const category = [];

    // Hold the tags of each post
    const tags = [];

    // Hold the moderation info of each post
    const moderation = [];

    // Iterate over the results from the database to generate the urls.
    postsList.forEach((post) => {
      urls.push(`https://api.steemjs.com/get_content?author=${post.author}&permlink=${post.permlink}`);
      category.push(post.category);
      tags.push(post.tags);
      moderation.push(post.moderation); 
    });

    // Track the index of the posts
    let index = -1;

    // Do all the http calls and grab the results at the end. it will do 15 parallel calls.
    async.mapLimit(postsList, 15, async (post) => {
      // Fetch the http GET call results
      //const response = await request({ url, json: true });

      const response = await steem.api.getContentAsync(post.author, post.permlink);

      // If the post does not have an id, skip it
      if (!response.id) {
        index += 1; // Since the post is skiped, also skip one position
        return null;
      }

      let isVoted = false;

      // Check if there is a user provided in the params.
      // If so, determine if this user has voted the post.
      if (username) {
        isVoted = helper.isVoted(response.active_votes, username);
      }

      // Convert the body from markdown into HTML to strip it
      let body = md.render(response.body);

      // Strip all the tags to get only text
      body = striptags(body);

      // Remove all urls from the body
      body = body.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

      // Unscape some HTML characters
      body = body.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, '\'');

      // Truncate the characters to 250
      body = body.substring(0, 250);

      // Get the date in timestamp
      const date = +new Date(response.created);

      // Parse JSON metadata
      response.json_metadata = JSON.parse(response.json_metadata);

      // Format author reputation
      const authorReputation = steem.formatter.reputation(response.author_reputation);

      // Determine if the cover image exists
      const coverImage = response.json_metadata.image ? response.json_metadata.image[0] : null;

      // Calculate total payout for vote values
      const totalPayout = parseFloat(response.pending_payout_value) +
        parseFloat(response.total_payout_value) +
        parseFloat(response.curator_payout_value);

      index += 1; // Increase here since first one is declared as -1.

      // Parse only the fields needed.
      // TODO: Determine what fields we need
      return {
        title: response.title,
        description: body.trim(),
        coverImage,
        author: response.author,
        authorReputation,
        authorImage: `https://steemitimages.com/u/${response.author}/avatar/small`,
        permlink: response.permlink,
        postedAt: date,
        category: post.category,
        tags: post.tags,
        moderation: post.moderation,
        votesCount: response.net_votes,
        commentsCount: response.children,
        totalPayout,
        isVoted,
      };

    // Grab results or catch errors
    }, (err, results) => {
      // If there is any error, send it to the client.
      if (err) return next(err);

      // Cleanup null elements in the array
      results = results.filter(e => e);

      // Send the results to the client in a formatted JSON.
      res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        results,
        count: results.length, // Recalculate the count by taking out the offset
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
 * Method to retrieve votes from a post
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.getVotes = async (req, res, next) => {
  try {
    // Grab the parameters from the param
    const { author, permlink } = req.params;

    // Grab the post to see if the post exists
    const postDb = await Post.findOne({ permlink });

    // If the post does not exist in the database, stop the request
    if (!postDb) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Construct the url for the http call
    //const url = `https://api.steemjs.com/get_content?author=${author}&permlink=${permlink}`;

    // Make a GET call to the url and grab the results
    //const post = await request({ url, json: true });

    const post = await steem.api.getContentAsync(author, permlink);

    // If there are not results from this post, let the client know.
    if (!post.id) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Calculate total payout for vote values
    const totalPayout = parseFloat(post.pending_payout_value) +
                        parseFloat(post.total_payout_value) +
                        parseFloat(post.curator_payout_value);

    // Calculate recent voteRshares and ratio values.
    const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    const ratio = totalPayout / voteRshares;

    // Calculate exact values of votes
    // eslint-disable-next-line
    for (let i in post.active_votes) {
      post.active_votes[i].voteValue = parseFloat((post.active_votes[i].rshares * ratio).toFixed(2));
      post.active_votes[i].voterReputation = steem.formatter.reputation(post.active_votes[i].reputation);
      // eslint-disable-next-line
      post.active_votes[i].percent = post.active_votes[i].percent / 100;
      post.active_votes[i].votedAt = +new Date(post.active_votes[i].time);
      post.active_votes[i].voterImage = `https://steemitimages.com/u/${post.active_votes[i].voter}/avatar/small`;
    }

    // Sort votes by vote value
    const activeVotes = post.active_votes.slice(0);
    activeVotes.sort((a, b) => parseFloat(b.voteValue) - parseFloat(a.voteValue));

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      results: activeVotes,
    });

  // Catch any possible error.
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to get a single post from Steem Blockchain
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @author Huseyin Terkir (hsynterkr) Refactored: Jayser Mendez
 * @returns an object with the post from Steem Blockchain
 * @public
 */
exports.getSinglePost = async (req, res, next) => {
  try {
    // Grab the parameters from the param
    const { author, permlink } = req.params;
    const { username } = req.query;

    // Grab the post from the DB to merge the data
    const postDb = await Post.findOne({ permlink });

    // If the post does not exist in the database, stop the request
    if (!postDb) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Construct the url for the http call
    //const url = `https://api.steemjs.com/get_content?author=${author}&permlink=${permlink}`;

    // Make a GET call to the url and grab the results
    //const post = await request({ url, json: true });

    const post = await steem.api.getContentAsync(author, permlink);

    // If there are not results from this post, let the client know.
    if (!post.id) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Parse the JSON metadata of the post since it is not parsed by default.
    post.json_metadata = JSON.parse(post.json_metadata);

    // Get body image of the post.
    const coverImage = post.json_metadata.image ? post.json_metadata.image[0] : null;

    // Use steem formatter to format reputation
    const authorReputation = steem.formatter.reputation(post.author_reputation);

    // Calculate total payout for vote values
    const totalPayout = parseFloat(post.pending_payout_value) +
                        parseFloat(post.total_payout_value) +
                        parseFloat(post.curator_payout_value);

    // Calculate recent voteRshares and ratio values.
    const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    const ratio = totalPayout / voteRshares;

    // Calculate exact values of votes
    // eslint-disable-next-line
    for (let i in post.active_votes) {
      post.active_votes[i].voteValue = parseFloat((post.active_votes[i].rshares * ratio).toFixed(2));
      post.active_votes[i].voterReputation = steem.formatter.reputation(post.active_votes[i].reputation);
      // eslint-disable-next-line
      post.active_votes[i].percent = post.active_votes[i].percent / 100;
      post.active_votes[i].votedAt = +new Date(post.active_votes[i].time);
      post.active_votes[i].voterImage = `https://steemitimages.com/u/${post.active_votes[i].voter}/avatar/small`;
    }

    // Sort votes by vote value
    const activeVotes = post.active_votes;
    activeVotes.sort((a, b) => parseFloat(b.voteValue) - parseFloat(a.voteValue));

    let isVoted = false;

    // Check if the post is voted by the provided user
    if (username) {
      isVoted = helper.isVoted(post.active_votes, username);
    }

    // eslint-disable-next-line
    post['isVoted'] = isVoted;

    // Get the date in timestamp
    const date = +new Date(post.created);

    let comments = await constructComments(author, permlink, username);
    comments = comments.reverse(); // Reverse the array to show recent first

    // Send the results to the client
    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      results: {
        title: post.title,
        description: post.body,
        coverImage,
        author: post.author,
        authorReputation,
        authorImage: `https://steemitimages.com/u/${post.author}/avatar/small`,
        permlink: post.permlink,
        postedAt: date,
        category: postDb.category,
        tags: postDb.tags,
        votesCount: post.net_votes,
        commentsCount: post.children,
        comments,
        totalPayout,
        activeVotes,
        isVoted,
      },
    });

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
 * Method to get comments of a specific post
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.getComments = async (req, res, next) => {
  try {
    // Grab the parameters from the param
    const { author, permlink } = req.params;
    const { username } = req.query;

    // Grab the post from the DB to merge the data
    const postDb = await Post.findOne({ permlink });

    // If the post does not exist in the database, stop the request
    if (!postDb) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Construct the url for the http call
    //const url = `https://api.steemjs.com/get_content?author=${author}&permlink=${permlink}`;

    // Make a GET call to the url and grab the results
    //const post = await request({ url, json: true });

    const post = await steem.api.getContentAsync(author, permlink);

    // If there are not results from this post, let the client know.
    if (!post.id) {
      return next({
        status: httpStatus.NOT_FOUND,
        message: 'This post cannot be found in our records',
      });
    }

    // Grab all the comments for this post
    let comments = await constructComments(author, permlink, username);
    comments = comments.reverse(); // Reverse the array to show recent first

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      results: comments,
    });

  // Catch any possible error.
  } catch (err) {
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

/**
 * Method to fetch comments with replies
 * @param {String} author: author of the post
 * @param {String} permlink: permlink of the post
 * @param {String} username: username of the current user
 * @param {Function} next: Express.js middleware callback
 * @private
 * @author Jayser Mendez
 */
// eslint-disable-next-line
const constructComments = async (author, permlink, username, next) => {
  try {
    // Inner function to fetch replies
    // eslint-disable-next-line
    const fetchReplies = (author, permlink) => {
      // Call Steem RPC server to get the replies of the current post
      return client.sendAsync('get_content_replies', [author, permlink])
        // eslint-disable-next-line
        .then((replies) => {
          // Map the responses with the post
          return Promise.map(replies, async (r) => {
            // If there are replies to this comment, recursively grab them
            if (r.children > 0) {
              // Fectch the replies of the comment recursively by calling the method again
              return fetchReplies(r.author, r.permlink)
                .then(async (children) => {
                  // Grab the active votes of the current comment
                  const activeVotes = await client.sendAsync('get_active_votes', [r.author, r.permlink]);

                  // Determine if the current reply is voted by the username
                  const isVoted = helper.isVoted(activeVotes, username);

                  // Calculate the total payout of this reply
                  const totalPayout = parseFloat(r.pending_payout_value) +
                        parseFloat(r.total_payout_value) +
                        parseFloat(r.curator_payout_value);

                  // Return the formatted reply
                  return {
                    description: r.body,
                    parentAuthor: r.parent_author,
                    authorImage: `https://steemitimages.com/u/${r.author}/avatar/small`,
                    postedAt: r.created,
                    url: r.url,
                    permlink: r.permlink,
                    authorReputation: steem.formatter.reputation(r.author_reputation),
                    author: r.author,
                    category: r.category,
                    votesCount: r.net_votes,
                    totalPayout,
                    isVoted,
                    repliesCount: r.children,
                    replies: children,
                  };
                });
            }

            // Grab the active votes of the current comment
            const activeVotes = await client.sendAsync('get_active_votes', [r.author, r.permlink]);

            // Determine if the current reply is voted by the username
            const isVoted = helper.isVoted(activeVotes, username);

            // Calculate the total payout of this reply
            const totalPayout = parseFloat(r.pending_payout_value) +
                        parseFloat(r.total_payout_value) +
                        parseFloat(r.curator_payout_value);

            // Return the formatted reply
            return {
              description: r.body,
              parentAuthor: r.parent_author,
              authorImage: `https://steemitimages.com/u/${r.author}/avatar/small`,
              postedAt: r.created,
              url: r.url,
              permlink: r.permlink,
              authorReputation: steem.formatter.reputation(r.author_reputation),
              author: r.author,
              category: r.category,
              votesCount: r.net_votes,
              totalPayout,
              isVoted,
              repliesCount: r.children,
              replies: [],
            };
          });
        });
    };

    // Return the replies recursively
    return fetchReplies(author, permlink);

  // Catch any possible error.
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
