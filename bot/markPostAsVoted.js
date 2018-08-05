const mongo = require('mongodb').MongoClient;

module.exports = (post, callback) => {
  mongo.connect(
    process.env.KNACKBOT_MONGO_URI,
    { useNewUrlParser: true },
    (err, conn) => {
      if (!err) {
        conn
          .db(process.env.KNACKBOT_DB_NAME || 'knacksteem')
          .collection(process.env.KNACKBOT_COLLECTION_NAME || 'posts')
          .updateOne(
            { author: post.author, permlink: post.permlink },
            { $set: { voting: { voted: true } } },
            (err, result) => {
              if (!err) {
                callback(null, result);
              } else {
                callback(result);
              }
            }
          );
      } else {
        callback(err);
      }
    }
  );
};
