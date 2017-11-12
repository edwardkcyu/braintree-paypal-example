import axios from "axios";
import { GATEWAY_URL } from "./constants";

export const getTransaction = (customerName, paymentId) => {
  return axios
    .get(`${GATEWAY_URL}/transactions`, {
      params: {
        customerName,
        paymentId
      }
    })
    .then(result => result.data.data.transaction);
};

export const checkPayable = (currency, cardType) => {
  return axios
    .get(`${GATEWAY_URL}/payment/verify`, {
      params: {
        currency,
        cardType
      }
    })
    .then(res => res.data.data);
};

export const pay = params => {
  return axios
    .post(`${GATEWAY_URL}/payment`, {
      ...params
    })
    .then(res => res.data);
};
