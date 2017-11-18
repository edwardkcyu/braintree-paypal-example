import * as redis from '../../shared/redis';
import * as mongo from '../../shared/mongo';

export const retrieveTransaction = async ({ db, cache, customerName, paymentId }) => {
  let transaction;
  try {
    transaction = await redis.get(cache, `transaction:${customerName}:${paymentId}`);
  } catch (e) {
    transaction = await mongo.findOne(db, 'transaction', { customerName, paymentId });

    if (transaction) {
      redis.set(cache, `transaction:${customerName}:${paymentId}`, transaction); // cache the record
    }
  }

  return transaction;
};
