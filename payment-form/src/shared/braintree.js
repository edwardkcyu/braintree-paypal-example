import axios from "axios";
import braintree from "braintree-web";
import { GATEWAY_URL } from "./constants";

export const getClientToken = () => {
  return axios({
    url: `${GATEWAY_URL}/client-token`,
    responseType: "text"
  });
};

export const getPaymentService = type => {
  return axios.post(`${GATEWAY_URL}/payment-service`, {
    cardType: type
  });
};

export const pay = (data) => {
  return axios.post(`${GATEWAY_URL}/payment`, {
    ...data
  });
};

export const createClient = authroization => {
  return new Promise((resolve, reject) => {
    braintree.client.create(
      {
        authorization: authroization
      },
      (err, clientInstance) => {
        if (err) {
          reject(err);
        }
        resolve(clientInstance);
      }
    );
  });
};

export const tokenize = (client, data) => {
  return new Promise((resolve, reject) => {
    client.request(
      {
        endpoint: "payment_methods/credit_cards",
        method: "post",
        data: data
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          const cards = res.creditCards;
          if (cards && cards[0]) {
            resolve(cards[0].nonce);
          }
        }
      }
    );
  });
};
