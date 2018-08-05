const mongo = require('mongodb').MongoClient;
const logger = require('./configureLogger');

module.exports = callback => {
  mongo.connect(
    process.env.KNACKBOT_MONGO_URI,
    { useNewUrlParser: true },
    (err, conn) => {
      if (!err) {
        conn
          .db(process.env.KNACKBOT_DB_NAME || 'knacksteem')
          .collection(process.env.KNACKBOT_COLLECTION_NAME || 'posts')
          .findOne(
            { approved: true, voting: { $exists: false } },
            { createdAt: 1 },
            (err, result) => {
              if (!err) {
                callback(null, result);
              } else {
                logger.error(
                  `Error querying posts:\n${JSON.stringify(err, null, 2)}`
                );
              }
            }
          );
      } else {
        callback(err);
      }
    }
  );
};
