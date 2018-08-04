const mongo = require('mongodb');
const logger = require('./configureLogger');

mongo.connect(process.env.KNACKBOT_MONGO_URI, (err, connection) => {
  if (!err) {
    connection
      .db(process.env.KNACKBOT_DB_NAME)
      .collection(process.env.KNACKBOT_COLLECTION_NAME)
      .findOne({ approved: true }, {createdAt: 1}, (err, result) => {
          if (!err) {
              logger.info(result);
          } else {
            logger.error(err);   
          }
      });
  } else {
    logger.error(err);
  }
});
