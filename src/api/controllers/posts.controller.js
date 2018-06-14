/**
 * Returns jwt token if valid username and SC2 Object is provided
 * @public
 */
exports.createPost = async (req, res, next) => {
  try {
    res.send({
      message: res.locals.username,
    });

    // If any error, catch it
  } catch (error) {
    return next(error);
  }
};
