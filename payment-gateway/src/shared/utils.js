import * as mongo from './shared/mongo';
import * as redis from './shared/redis';

export const initialize = async () => {
  const db = await mongo.createClient();
  const cache = await redis.createClient();
  return { db, cache };
};
