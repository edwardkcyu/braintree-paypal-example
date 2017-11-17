

import { MongoClient } from "mongodb";
import config from '../config.json'

export const createClient = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.mongoUrl, (err, db) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

export const findOne = (mongo, collection, query) => {
  return new Promise((resolve, reject) => {
    mongo.collection(collection).findOne(query, (err, record) => {
      if (err) {
        reject(err);
      } else if (!record) {
        resolve(null);
      } else {
        resolve({ ...record, remark: "from DB" });
      }
    });
  });
};
