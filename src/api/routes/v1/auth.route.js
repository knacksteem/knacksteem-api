const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/auth.controller');
const oAuthLogin = require('../../middlewares/auth').oAuth;
const {
  login,
  register,
  oAuth,
  refresh,
} = require('../../validations/auth.validation');

const router = express.Router();

router.route('/login')
  .post(validate(login), controller.login);

router.route('/refresh-token')
  .post(validate(refresh), controller.refresh);

module.exports = router;
