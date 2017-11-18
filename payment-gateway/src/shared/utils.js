import * as mongo from './mongo';
import * as redis from './redis';

export const initialize = async () => {
  const db = await mongo.createClient();
  const cache = redis.createClient();
  return { db, cache };
};
