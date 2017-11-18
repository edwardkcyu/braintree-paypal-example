import 'babel-polyfill';

import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import config from './config.json';
import * as utils from './shared/utils';
import { paymentRoutes, transactionRoutes } from './routes';

const start = async () => {
  const port = process.env.PORT || config.port;

  const app = express();
  app.server = http.createServer(app);

  app.use(morgan('dev'));
  app.use(cors());
  app.use(bodyParser.json());
  const dbClients = await utils.initialize();

  app.use('/', paymentRoutes(dbClients));
  app.use('/', transactionRoutes(dbClients));

  app.server.listen(port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
};

start();
