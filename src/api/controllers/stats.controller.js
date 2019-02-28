const Post = require('../models/post.model');
const User = require('../models/user.model');
const httpStatus = require('http-status');
const async = require('async');
const request = require('request-promise-native');
const steem = require('steem');
const md = require('../../config/remarkable');
const striptags = require('striptags');
const helper = require('../utils/Helper');

/**
 * Method to generate a MongoDB query based on a given criteria
 * @param {String} filter: criteria to determine the query
 * @private
 * @author Jayser Mendez
 */
const buildQuery = (filter, req) => {
  // List and count all the posts pending of moderation
  if (filter === 'moderation_pending') {
    return {
      'moderation.moderated': false,
      'moderation.reservedUntil': { $lt: Date.now() },
    };

  // List and count all the approved posts
  } else if (filter === 'moderation_approved') {
    let query = { 'moderation.approved': true };

    // If the request has params, it is the username, append it.
    if (Object.keys(req.query).length !== 0) {
      query = { ...query, 'moderation.moderatedBy': req.query.author };
    }

    return query;

  // List and count all the not approved posts
  } else if (filter === 'moderation_not_approved') {
    let query = { 'moderation.approved': false };

    // If the request has params, it is the username, append it.
    if (Object.keys(req.query).length !== 0) {
      query = { ...query, 'moderation.moderatedBy': req.query.author };
    }

    return query;

  // List and count all the reserved posts
  } else if (filter === 'reserved') {
    let query = {
      'moderation.reserved': true,
      'moderation.reservedUntil': { $gt: Date.now() },
    };

    // If the request has params, it is the username, append it.
    if (Object.keys(req.query).length !== 0) {
      query = {
        ...query,
        'moderation.reservedBy': req.query.username,
      };
    }

    return query;

  // List and count all moderated posts
  } else if (filter === 'moderated') {
    let query = { 'moderation.moderated': true };

    // If the request has params, it is the username, append it.
    if (Object.keys(req.query).length !== 0) {
      query = { ...query, 'moderation.moderatedBy': req.query.author };
    }

    return query;
  }

  return false;
};

/**
 * Send stats response with the provided criteria
 * @param {String} filter: criteria to determine the query
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.sendStats = filter => async (req, res, next) => {
  try {
    // Grab the params from the request
    const { username } = req.query;
    let { limit, skip } = req.query;
    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);

    // Sort Query
    const sort = { createdAt: -1 };

    // Find the post in the database
    const postsList = await Post.find(buildQuery(filter, req))
      .limit(limit || 25)
      .skip(skip || 0)
      .sort(sort);

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

  // Catch errors here.
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to construct query based on parameters
 * @param {Object} req: url params
 * @private
 * @author Jayser Mendez
 */
const constructQuery = (req) => {
  const { search, username, banned } = req.query;

  // Query for username
  const usernameCondition = (username);
  const usernameQuery = { username };

  // Query for search
  const searchCondition = (search);
  const searchQuery = { username: { $regex: search, $options: 'i' } };

  // Query for banned users
  const bannedCondition = (banned);
  const bannedQuery = { isBanned: banned };

  // All Conditions (exclude usernameCondition since it is a single result)
  const allConditions = (searchCondition && bannedCondition);
  const allQuery = {
    username: { $regex: search, $options: 'i' },
    isBanned: banned,
  };

  /**
   * If saerch and banned exist in the query, return query based by search and banned.
   * Else if If the username exist in the query, return query by user.
   * Else if the search is in the query, return query by search.
   * Else if banned is in the query, return query by banned
   * Else return all users
   */
  // eslint-disable-next-line
  return allConditions ? allQuery : ( usernameCondition ? usernameQuery : ( searchCondition ? searchQuery : (bannedCondition ? bannedQuery : {})));
};

/**
 * Method to query and list all users in database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.allUsers = async (req, res, next) => {
  try {
    // Grab the params from the request
    let { limit, skip } = req.query;
    limit = parseInt(limit, 10);
    skip = parseInt(skip, 10);

    // construct the query for database
    const query = constructQuery(req);

    // Find all the users from database
    const users = await User.find(query)
      .limit(limit || 25)
      .skip(skip || 0)
      .select({
        _id: 0,
        username: 1,
        roles: 1,
        isBanned: 1,
        bannedUntil: 1,
        banReason: 1,
        bannedBy: 1,
        createdAt: 1,
        tokens: 1,
      });

    // Check if there is a response
    if (users.length > 0) {
      // Send the response to the client formatted.
      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        results: users,
        count: users.length,
      });
    }

    // Otherwise, return 404
    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'There are not results matching your query.',
    });

  // Catch errors here.
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

