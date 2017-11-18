import * as mongo from '../../shared/mongo';
import * as redis from '../../shared/redis';

export const standardizeResponse = ({ code, data }) => {
  return {
    meta: {
      code
    },
    data: {
      ...data
    }
  };
};

export const standardizeErrorResponse = ({ code, error, type, reason }) => {
  return {
    meta: {
      code,
      error,
      type,
      reason
    },
    data: {}
  };
};

export const verifyPayment = (cardType, currency) => {
  if (cardType === 'american-express') {
    if (currency === 'USD') {
      return 'paypal';
    } else {
      return null;
    }
  } else if (currency === 'USD' || currency === 'EUR' || currency === 'AUD') {
    return 'paypal';
  } else {
    return 'braintree';
  }
};
