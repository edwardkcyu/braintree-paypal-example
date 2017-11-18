import React from "react";
import cardValidator from "card-validator";
import swal from "sweetalert";

import * as braintree from "../shared/braintree";
import * as service from "../shared/service";

import {
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Well,
  HelpBlock,
  Alert
} from "react-bootstrap";

export default class PaymentForm extends React.Component {
  constructor(props) {
    super(props);
    this.DEFAULT_STATE = {
      customerName: "Test Customer",
      customerPhone: "12345678",
      currency: "HKD",
      amount: "5",
      cardHolder: "Test Card Holder",
      cardNumber: "4111111111111111",
      cardExpiration: "01/20",
      cardExpirationMonth: "01",
      cardExpirationYear: "2020",
      cardCvv: "123",
      cardType: "visa",
      isProcessing: false,
      isValid: true
    };

    this.state = this.DEFAULT_STATE;

    this.currencies = ["HKD", "USD", "AUD", "EUR", "JPY", "CNY"];
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error: error });
  }

  validateForm = () => {
    let isValid = false;
    if (
      this.state.customerName &&
      this.state.customerPhone &&
      this.state.cardHolder &&
      cardValidator.number(this.state.cardNumber).isValid &&
      cardValidator.expirationDate(this.state.cardExpiration).isValid &&
      cardValidator.cvv(this.state.cardCvv).isValid
    ) {
      isValid = true;
    }
    return isValid;
  };

  getCardExpirationValidationState = value => {
    const validation = cardValidator.expirationDate(value);
    return validation.isValid ? "success" : "error";
  };

  getCardCvvValidationState = value => {
    const validation = cardValidator.cvv(value);
    return validation.isValid ? "success" : "error";
  };

  getCardNumberValidationState = value => {
    const validation = cardValidator.number(value);
    return validation.isValid ? "success" : "error";
  };

  getGeneralValidationState = value => {
    return value ? "success" : "error";
  };

  handleChange = (field, value) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [field]: value
      };
    });
  };

  handleCardExpirationChange = value => {
    const validation = cardValidator.expirationDate(value);
    console.log(validation);

    this.setState(prevState => {
      return {
        ...prevState,
        cardExpiration: value,
        cardExpirationMonth: validation.month,
        cardExpirationYear: validation.year
      };
    });
  };

  handleCardNumberChange = value => {
    const validation = cardValidator.number(value);
    this.setState(prevState => {
      return {
        ...prevState,
        cardNumber: value,
        cardType: validation.card && validation.card.type
      };
    });
  };

  payByBraintree = () => {
    const data = {
      creditCard: {
        number: this.state.cardNumber,
        cvv: this.state.cardCvv,
        expirationDate: this.state.cardExpiration,
        billingAddress: {
          postalCode: "12345"
        },
        cardholderName: this.state.cardHolder,
        options: {
          validate: false
        }
      }
    };

    return braintree
      .getClientToken()
      .then(res => braintree.createClient(res.data.data.token))
      .then(clientInstance => braintree.tokenize(clientInstance, data))
      .then(nonce =>
        braintree.pay({
          amount: this.state.amount,
          customerName: this.state.customerName,
          customerPhone: this.state.customerPhone,
          currency: this.state.currency,
          paymentType: "braintree",
          nonce
        })
      );
  };

  submit = async () => {
    if (!this.validateForm()) {
      swal("Please fix the incorrect inputs!", "", "error");
      return;
    }
    this.setState(prevState => {
      return {
        ...prevState,
        isProcessing: true
      };
    });

    let verification;
    try {
       verification = await service.checkPayable(
        this.state.currency,
        this.state.cardType
      );
    }
    catch(e) {
      swal(
        "Orz",
        `Error connecting payment server`,
        "error"
      );

      this.setState(prevState => {
        return {
          ...prevState,
          isProcessing: false
        };
      });

      return;
    }

    if (!verification.allowed) {
      swal(
        "Orz",
        `Paying ${
          this.state.currency
        } with ${this.state.cardType.toLocaleUpperCase()} is not allowed`,
        "error"
      );
      this.setState(prevState => {
        return {
          ...prevState,
          isProcessing: false
        };
      });
    } else {
      if (verification.type === "braintree") {
        this.payByBraintree()
          .then(result => result.data)
          .then(data => {
            console.log(data);
            swal(
              "Payment is successful!",
              `Payment ID: ${data.data.transaction.paymentId}`,
              "success"
            );
            this.setState(prevState => {
              return {
                ...prevState,
                isProcessing: false
              };
            });
          })
          .catch(e => {
            swal(
              "Payment is not successful!",
              e.response.data.meta.reason || "",
              "error"
            );
            this.setState(prevState => {
              return {
                ...prevState,
                isProcessing: false
              };
            });
          });
      } else {
        // for other non client dependent payment (e.g. paypal)
        service
          .pay({
            amount: this.state.amount,
            customerName: this.state.customerName,
            customerPhone: this.state.customerPhone,
            currency: this.state.currency,
            cardHolder: this.state.cardHolder,
            cardNumber: this.state.cardNumber,
            cardExpirationMonth: this.state.cardExpirationMonth,
            cardExpirationYear: this.state.cardExpirationYear,
            cardCvv: this.state.cardCvv,
            paymentType: verification.type,
            cardType: this.state.cardType
          })
          .then(data => {
            console.log(data);
            swal(
              "Payment is successful!",
              `Payment ID: ${data.data.transaction.paymentId}`,
              "success"
            );
            this.setState(prevState => {
              return {
                ...prevState,
                isProcessing: false
              };
            });
          })
          .catch(e => {
            swal(
              "Payment is not successful!",
              e.response.data.meta.reason || "",
              "error"
            );
            this.setState(prevState => {
              return {
                ...prevState,
                isProcessing: false
              };
            });
          });
      }
    }
  };

  render() {
    let info = null;
    if (this.state.isProcessing) {
      info = (
        <Alert bsStyle="info">
          <strong>Payment in progress.....</strong>
        </Alert>
      );
    }

    return (
      <Panel>
        <form>
          <fieldset disabled={this.state.isProcessing}>
            <Well style={{ background: "white" }}>
              <Well>
                <FormGroup
                  controlId="customerName"
                  validationState={this.getGeneralValidationState(
                    this.state.customerName
                  )}
                >
                  <ControlLabel>Customer Name</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.customerName}
                    onChange={e =>
                      this.handleChange("customerName", e.target.value)
                    }
                  />
                  <FormControl.Feedback />
                </FormGroup>
                <FormGroup
                  controlId="customerPhone"
                  validationState={this.getGeneralValidationState(
                    this.state.customerPhone
                  )}
                >
                  <ControlLabel>Customer Phone</ControlLabel>
                  <FormControl
                    type="number"
                    value={this.state.customerPhone}
                    onChange={e =>
                      this.handleChange("customerPhone", e.target.value)
                    }
                  />
                  <FormControl.Feedback />
                </FormGroup>
                <FormGroup controlId="currency">
                  <ControlLabel>Currency</ControlLabel>
                  <FormControl
                    componentClass="select"
                    placeholder="select"
                    value={this.state.currency}
                    onChange={e =>
                      this.handleChange("currency", e.target.value)
                    }
                  >
                    {this.currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
                <FormGroup
                  controlId="amount"
                  validationState={this.getGeneralValidationState(
                    this.state.amount
                  )}
                >
                  <ControlLabel>Price</ControlLabel>
                  <FormControl
                    type="number"
                    value={this.state.amount}
                    onChange={e => this.handleChange("amount", e.target.value)}
                  />
                  <FormControl.Feedback />
                </FormGroup>
              </Well>
              <Well>
                <FormGroup
                  controlId="cardHolder"
                  validationState={this.getGeneralValidationState(
                    this.state.cardHolder
                  )}
                >
                  <ControlLabel>Credit Card Holder Name</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.cardHolder}
                    onChange={e =>
                      this.handleChange("cardHolder", e.target.value)
                    }
                  />
                  <FormControl.Feedback />
                </FormGroup>
                <FormGroup
                  controlId="cardNumber"
                  validationState={this.getCardNumberValidationState(
                    this.state.cardNumber
                  )}
                >
                  <ControlLabel>Credit Card Number</ControlLabel>
                  <FormControl
                    type="number"
                    value={this.state.cardNumber}
                    onChange={e => this.handleCardNumberChange(e.target.value)}
                  />
                  <FormControl.Feedback />
                  <HelpBlock>
                    {this.state.cardType
                      ? "Card Type: " + this.state.cardType.toUpperCase()
                      : ""}
                  </HelpBlock>
                </FormGroup>
                <FormGroup
                  controlId="cardExpiration"
                  validationState={this.getCardExpirationValidationState(
                    this.state.cardExpiration
                  )}
                >
                  <ControlLabel>Card Expiration</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.cardExpiration}
                    onChange={e =>
                      this.handleCardExpirationChange(e.target.value)
                    }
                  />
                  <FormControl.Feedback />
                  <HelpBlock>Format: MM/YY or MM/YYYY</HelpBlock>
                </FormGroup>
                <FormGroup
                  controlId="cardCvv"
                  validationState={this.getCardCvvValidationState(
                    this.state.cardCvv
                  )}
                >
                  <ControlLabel>CVV</ControlLabel>
                  <FormControl
                    type="number"
                    value={this.state.cardCvv}
                    onChange={e => this.handleChange("cardCvv", e.target.value)}
                  />
                  <FormControl.Feedback />
                </FormGroup>
              </Well>
              <Button onClick={this.submit}>Submit</Button>
            </Well>
          </fieldset>
          {info}
        </form>
      </Panel>
    );
  }
}
