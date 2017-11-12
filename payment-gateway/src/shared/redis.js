import redis from "redis";
import Promise from "es6-promise";

import config from '../config.json'

export const createClient = () => {
  return redis.createClient(config.redisPort, "localhost");
};

export const get = (redis, key) => {
  return new Promise((resolve, reject) => {
    
    redis.get(key, (err, record) => {
      if (err) {
        reject(err);
      } else if (!record) {
        reject("Not found from cache");
      } else {
        // found in cache
        resolve({...JSON.parse(record), remark: "from cache"});
      }
    });
  });
};

export const set = (redis, key, value) => {
  return new Promise((resolve, reject) => {
    redis.set(key, JSON.stringify(value), (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
