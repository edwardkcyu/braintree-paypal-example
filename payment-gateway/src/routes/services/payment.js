import { standardizeErrorResponse, standardizeResponse } from './utils';
import * as mongo from '../../shared/mongo';

export const payByBraintree = async (
  db,
  braintreeClient,
  { amount, nonce, customerName, customerPhone, currency },
  res
) => {
  try {
    const result = await braintreeClient.pay({ amount, nonce });

    if (result.success) {
      const dbRecord = {
        customerName,
        customerPhone,
        currency,
        amount,
        service: 'braintree',
        paymentId: result.transaction.id,
        updatedAt: result.transaction.updatedAt
      };

      mongo.save(db, 'transaction', dbRecord);
      
      res.status(201).send(standardizeResponse({ code: 201, data: { transaction: dbRecord } }));
    } else {
      res.status(500).send(
        standardizeErrorResponse({
          code: 50011,
          error: 'Payment is not successful',
          message: result.message
        })
      );
    }
  } catch (e) {
    console.error(50012, e);
    res.status(500).send(
      standardizeErrorResponse({
        code: 50012,
        error: 'Payment is not successful',
        reason: e.message
      })
    );
  }
};

export const payByPaypal = async (db, paypalClient, data, res) => {
  const { customerName, customerPhone, currency, amount } = data;

  try {
    const result = await paypalClient.pay(data);

    if (result.httpStatusCode === 201) {
      const dbRecord = {
        customerName,
        customerPhone,
        currency,
        amount,
        service: 'paypal',
        paymentId: result.id,
        updatedAt: result.update_time
      };

      mongo.save(db, 'transaction', dbRecord);

      res.status(201).send(standardizeResponse({ code: 201, data: { transaction: dbRecord } }));
    } else {
      res.status(500).send(standardizeErrorResponse({ code: 5002, error: 'Payment is not successful' }));
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(
      standardizeErrorResponse({
        code: 5002,
        error: 'Payment is not successful',
        reason: e.response && e.response.message
      })
    );
  }
};
