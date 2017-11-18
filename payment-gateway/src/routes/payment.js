import { Router } from 'express';
import paypal from 'paypal-rest-sdk';

import config from '../config.json';
import { BraintreeClient, PaypalClient } from '../modules/payment';
import { standardizeResponse, verifyPayment, standardizeErrorResponse } from './services/utils';
import { INTERNAL_ERROR, BAD_REQUEST } from '../constants/index';
import { payByBraintree, payByPaypal } from './services/payment';

export const paymentRoutes = ({ db, cache }) => {
  const paypalClient = new PaypalClient(config.paypalConfig);
  const braintreeClient = new BraintreeClient(config.braintreeConfig);

  const api = Router();

  api.get('/client-token', async (req, res) => {
    try {
      const token = await braintreeClient.generateClientToken();
      res.status(200).send(standardizeResponse({ code: 200, data: { token } }));
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .send(
          standardizeErrorResponse({ code: 5001, error: 'Unable to generate a braintree token', type: INTERNAL_ERROR })
        );
    }
  });

  api.get('/payment/verify', (req, res) => {
    const { cardType, currency } = req.query;
    const type = verifyPayment(cardType, currency);

    res.status(200).send(standardizeResponse({ code: 200, data: { type, allowed: type ? true : false } }));
  });

  api.post('/payment', (req, res) => {
    const {
      amount,
      nonce,
      customerName,
      customerPhone,
      currency,
      cardHolder,
      cardNumber,
      cardExpirationMonth,
      cardExpirationYear,
      cardCvv,
      paymentType,
      cardType
    } = req.body;

    if (paymentType === 'braintree') {
      payByBraintree(db, braintreeClient, { amount, nonce, customerName, customerPhone, currency }, res);
    } else if (paymentType === 'paypal') {
      payByPaypal(
        db,
        paypalClient,
        {
          amount,
          customerName,
          customerPhone,
          cardHolder,
          cardNumber,
          cardExpirationMonth,
          cardExpirationYear,
          cardCvv,
          cardType,
          currency
        },
        res
      );
    } else {
      res
        .status(500)
        .send(standardizeErrorResponse({ code: 5003, error: 'Unsupported payment type', type: BAD_REQUEST }));
    }
  });

  return api;
};
