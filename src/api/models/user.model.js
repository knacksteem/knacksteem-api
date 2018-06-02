const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

/**
* User Roles
*/
const roles = ['contributor', 'moderator','supervisor'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  user: {
    type: Object,
    required: true,
  },
  //setting default role as contributor
  role: {
    type: String,
    enum: roles,
    default: 'contributor',
  },

}, {
  timestamps: true,
});

/**
 * Add your
 * - pre-save hooks currently none
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'username', 'user', 'role', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },
});

/**
 * Statics
 */
userSchema.statics = {

  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by username and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { username, sc2token, refreshObject } = options;
    if (!username) throw new APIError({ message: 'An username is required to generate a token' });

    const user = await this.findOne({ username }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (sc2token) {
        return { user, accessToken: user.token() };
      
      //err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.username === username) {
      return { user, accessToken: user.token() };
    } else {
      err.message = 'Incorrect username or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, username, role,
  }) {
    const options = omitBy({ username, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateUsername(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'username',
          location: 'body',
          messages: ['"username" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({
    service, id, username, 
  }) {
    const user = await this.findOne({ $or: [{ [`services.${service}`]: id }, { username }] });
    if (user) {
      user.services[service] = id;
      if (!user.username) user.username = username;
      return user.save();
    }
    return this.create({
      services: { [service]: id }, username,
    });
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
