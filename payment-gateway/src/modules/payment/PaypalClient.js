import paypal from 'paypal-rest-sdk';

export class PaypalClient {
  constructor({ mode, clientId, clientSecret }) {
    this.paypal = paypal;
    this.paypal.configure({
      mode,
      client_id: clientId,
      client_secret: clientSecret
    });

    this.cardTypeMapping = {
      'master-card': 'mastercard',
      'american-express': 'amex'
    };
  }

  pay = ({ amount, customerName, cardHolder, cardNumber, cardExpirationMonth, cardExpirationYear, cardCvv, cardType, currency }) => {
    const firstName = customerName
      .split(' ')
      .slice(0, -1)
      .join(' ');
    const lastName = customerName
      .split(' ')
      .slice(-1)
      .join(' ');

    const payment = {
      intent: 'sale',
      payer: {
        payment_method: 'credit_card',
        funding_instruments: [
          {
            credit_card: {
              type: this.cardTypeMapping[cardType] || cardType,
              number: cardNumber,
              expire_month: cardExpirationMonth,
              expire_year: cardExpirationYear,
              cvv2: cardCvv,
              first_name: firstName,
              last_name: firstName === lastName ? '' : lastName
            }
          }
        ]
      },

      transactions: [
        {
          amount: {
            total: amount,
            currency
          },
          description: `Payment - ${new Date().getTime()}`
        }
      ]
    };

    return new Promise((resolve, reject) => {
      this.paypal.payment.create(payment, function(error, payment) {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  };
}
