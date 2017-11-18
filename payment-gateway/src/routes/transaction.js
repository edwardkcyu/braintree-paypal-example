import { Router } from 'express';
import * as redis from '../shared/redis';
import * as mongo from '../shared/mongo';
import * as ErrorConstants from '../constants/error';
import { standardizeErrorResponse, standardizeResponse } from './services/utils';
import { retrieveTransaction } from './services/transaction';

export const transactionRoutes = ({ db, cache }) => {
  const api = Router();

  api.get('/transactions/', async (req, res) => {
    const { customerName, paymentId } = req.query;

    if (!customerName) {
      res
        .status(400)
        .send(
          standardizeErrorResponse({ code: 4001, error: 'Invalid customer name', type: ErrorConstants.BAD_REQUEST })
        );
    } else if (!paymentId) {
      res
        .status(400)
        .send(standardizeErrorResponse({ code: 4002, error: 'Invalid payment ID', type: ErrorConstants.BAD_REQUEST }));
    } else {
      try {
        let transaction = await retrieveTransaction({ db, cache, customerName, paymentId });
        res.status(200).send(standardizeResponse({ code: 200, data: { transaction } }));
      } catch (e) {
        console.error(e);
        res
          .status(500)
          .send(
            standardizeErrorResponse({ code: 500, error: 'Internal Server Error', type: ErrorConstants.INTERNAL_ERROR })
          );
      }
    }
  });

  return api;
};
