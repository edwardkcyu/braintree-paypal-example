import { Router } from "express";
import * as redis from "../shared/redis";
import * as mongo from "../shared/mongo";
import * as ErrorConstants from "../constants/error";

export const transactionRoutes = ({ db, cache }) => {
  const api = Router();

  api.get("/transactions/", (req, res) => {
    const { customerName, paymentId } = req.query;
    console.log(req.body);
    console.log(req.query);

    if (!customerName) {
      res.status(400).send({
        meta: {
          code: 4001,
          message: "Invalid customer name",
          type: ErrorConstants.BAD_REQUEST
        },
        data: {}
      });
    } else if (!paymentId) {
      res.status(400).send({
        meta: {
          code: 4002,
          message: "Invalid payment ID",
          type: ErrorConstants.BAD_REQUEST
        },
        data: {}
      });
    } else {
      redis
        .get(cache, `transaction:${customerName}:${paymentId}`)
        .catch(() => {
          return mongo
            .findOne(db, "transaction", { customerName, paymentId })
            .then(transaction => {
              if (transaction) {
                redis.set(
                  cache,
                  `transaction:${customerName}:${paymentId}`,
                  transaction
                ); // cache the record
              }

              return transaction;
            });
        })
        .then(transaction => {          
          res.status(200).send({
            meta: {
              code: 200
            },
            data: {
              transaction
            }
          });
          
        })
        .catch(e => {
          console.log(e);
          res.status(500).send({
            meta: {
              code: 500,
              message: "Internal Server Error",
              type: ErrorConstants.INTERNAL_ERROR
            },
            data: {}
          });
        });
    }
  });

  return api;
};
