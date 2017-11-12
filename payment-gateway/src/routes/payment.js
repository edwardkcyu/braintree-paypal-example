import { Router } from "express";
import paypal from "paypal-rest-sdk";

import config from "../config.json";

import { BraintreeClient, PaypalClient } from "../modules/payment";

export const paymentRoutes = ({ db, cache }) => {
  const paypalClient = new PaypalClient(config.paypalConfig);

  const braintreeClient = new BraintreeClient(config.braintreeConfig);

  const api = Router();

  api.get("/client-token", (req, res) => {
    braintreeClient
      .generateClientToken()
      .then(token => res.send(token))
      .catch(e => console.log(e));
  });

  api.get("/payment/verify", (req, res) => {
    const { cardType, currency } = req.query;

    let type;
    if (cardType === "american-express") {
      if (currency === "USD") {
        type = "paypal";
      } else {
        type = null;
      }
    } else if (currency === "USD" || currency === "EUR" || currency === "AUD") {
      type = "paypal";
    } else {
      type = "braintree";
    }

    res.status(200).send({
      meta: {
        code: 200
      },
      data: {
        type,
        allowed: type ? true : false
      }
    });
  });

  api.post("/payment", (req, res) => {
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
    console.log(req.body);

    if (paymentType === "braintree") {
      payByBraintree(db, braintreeClient, { amount, nonce, customerName, customerPhone, currency }, res);
    } else if (paymentType === "paypal") {
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
    }
  });

  return api;
};

const payByBraintree = (
  db,
  braintreeClient,
  { amount, nonce, customerName, customerPhone, currency },
  res
) => {
  braintreeClient
    .pay({ amount, nonce })
    .then(result => {
      if (result.success) {
        const dbRecord = {
          customerName,
          customerPhone,
          currency,
          amount,
          service: "braintree",
          paymentId: result.transaction.id,
          updatedAt: result.transaction.updatedAt
        };

        db.collection("transaction").save(dbRecord, res => {
          console.log(res);
        });

        res.status(201).send({
          meta: {
            code: 201
          },
          data: {
            transaction: dbRecord
          }
        });
      } else {
        res.status(500).send({
          meta: {
            code: 50011,
            error: "Payment is not successful",
            message: result.message
          },
          data: {}
        });
      }
    })
    .catch(e => {
      console.error(50012, e);
      res.status(500).send({
        meta: {
          code: 50012,
          error: "Payment is not successful",
          message: e.message
        },
        data: {}
      });
    });
};

const payByPaypal = (db, paypalClient, data, res) => {
  const { customerName, customerPhone, currency, amount } = data;

  paypalClient
    .pay(data)
    .then(result => {
      if (result.httpStatusCode === 201) {
        const dbRecord = {
          customerName,
          customerPhone,
          currency,
          amount,
          service: "paypal",
          paymentId: result.id,
          updatedAt: result.update_time
        };

        db.collection("transaction").save(dbRecord, res => {
          console.log(res);
        });

        res.status(201).send({
          meta: {
            code: 201
          },
          data: {
            transaction: dbRecord
          }
        });
      } else {
        res.status(500).send({
          meta: {
            code: 5002,
            error: "Payment is not successful"
          },
          data: {}
        });
      }
    })
    .catch(e => {
      console.error(e);
      res.status(500).send({
        meta: {
          code: 5002,
          error: "Payment is not successful",
          message: e.response && e.response.message
        },
        data: {}
      });
    });
};
