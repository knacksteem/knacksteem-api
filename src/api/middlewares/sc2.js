const sc2 = require('../../config/steemconnect');
const httpStatus = require('http-status');

/**
 * SC2 Validator. Validate if the provided access token is valid.
 * @author Jayser Mendez.
 * @public
 */
const validateSc2 = async (req, res, next) => {
  try {
    // Set the access token to the sc2 instance
    console.log(req.get('Authorization'));
    sc2.setAccessToken(req.get('Authorization'));

    // Call the sc2 api to validate the token.
    const sc2Res = await sc2.me();

    // Declare a local variable with the username.
    res.locals.username = sc2Res.user;

    // Move to the next middleware and pass username along.
    return next();

    // Catch the error if any.
  } catch (err) {
    // Send an error message in the response.
    return next({
      status: httpStatus.UNAUTHORIZED,
      message: 'Unauthorized access',
    });
  }
};

module.exports = validateSc2;
