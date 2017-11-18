import braintree from 'braintree';

export class BraintreeClient {
  constructor({ environment, merchantId, publicKey, privateKey }) {
    this.gateway = braintree.connect({
      environment: environment === 'production' ? braintree.Environment.Production : braintree.Environment.Sandbox,
      merchantId,
      publicKey,
      privateKey
    });
  }

  pay = ({ amount, nonce }) => {
    return new Promise((resolve, reject) => {
      this.gateway.transaction.sale(
        {
          amount: amount,
          paymentMethodNonce: nonce,
          options: {
            submitForSettlement: true
          }
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  generateClientToken = () => {
    return new Promise((resolve, reject) => {
      this.gateway.clientToken.generate({}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.clientToken);
        }
      });
    });
  };
}
