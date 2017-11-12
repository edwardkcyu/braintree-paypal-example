import React from "react";
import TransactionList from "./TransactionList";
import { getTransaction } from "../shared/service";

import {
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Well,
  Alert
} from "react-bootstrap";

export default class CheckForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      hasError: false,
      error: null,
      customerName: "Test Customer",
      paymentId: "",
      transaction: null
    };
  }

  handleChange = (field, value) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [field]: value
      };
    });
  };

  submit = () => {
    const { customerName, paymentId } = this.state;

    this.setState(prevState => {
      return {
        ...prevState,
        isProcessing: true
      };
    });
    getTransaction(customerName, paymentId)
      .then(transaction => {
        if(transaction) {
          this.setState(prevState => {
            return {
              ...prevState,
              // isProcessing: false,
              hasError: false,
              error: null,
              transaction
            };
          });
        }
        else {
          this.setState(prevState => {
            return {
              ...prevState,
              hasError: true,
              error: "Record not found!"
            }
          })
        }
      })
      .catch(e => {
        const meta = e.response.data && e.response.data.meta;
        this.setState(prevState => {
          return {
            ...prevState,
            hasError: true,
            error: meta.message || "Unknown error from server"
          };
        });
      })
      .then(() => {
        this.setState(prevState => {
          return { ...prevState, isProcessing: false };
        });
      });
  };

  render() {
    let body;
    if (this.state.isProcessing) {
      body = null;
    } else if (this.state.hasError) {
      body = (
        <Alert bsStyle="danger">
          <p>{this.state.error}</p>
        </Alert>
      );
    } else {
      body = (
        <TransactionList
          transaction={this.state.transaction}
          isProcessing={this.state.isProcessing}
        />
      );
    }

    return (
      <Panel>
        <form>
          <fieldset disabled={this.state.isProcessing}>
            <Well style={{ background: "white" }}>
              <Well>
                <FormGroup controlId="customerName">
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
                <FormGroup controlId="paymentId">
                  <ControlLabel>Reference Code</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.paymentId}
                    onChange={e =>
                      this.handleChange("paymentId", e.target.value)
                    }
                  />
                  <FormControl.Feedback />
                </FormGroup>
              </Well>
              <Button
                bsStyle="primary"
                disabled={this.state.isProcessing}
                onClick={!this.state.isProcessing ? this.submit : null}
              >
                {this.state.isProcessing ? "Loading..." : "Submit"}
              </Button>
            </Well>
          </fieldset>
        </form>
        {body}
      </Panel>
    );
  }
}
