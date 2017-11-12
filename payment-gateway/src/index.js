import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

import * as mongo from "./shared/mongo";
import * as redis from "./shared/redis";
import { paymentRoutes, transactionRoutes } from "./routes";
import config from "./config.json";

const port = process.env.PORT || config.port;

const app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));

app.use(cors());
app.use(bodyParser.json());

// initialize
mongo
  .createClient()
  .then(db => [db, redis.createClient()])
  .then(([db, cache]) => {
    app.use("/", paymentRoutes({ db, cache }));
    app.use("/", transactionRoutes({ db, cache }));

    app.server.listen(port, () => {
      console.log(`Started on port ${app.server.address().port}`);
    });
  })
  .catch(e => {
    console.error(e);
  });

export default app;
