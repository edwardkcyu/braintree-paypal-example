import React from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";

export default class TransactionList extends React.Component {
  PropTypes = {
    transaction: PropTypes.object.isRequired
  };

  render() {
    const transaction = this.props.transaction;
    if (transaction) {
      return [
        <h1 key="resultTitle">Result</h1>,

        <Table striped responsive key="result">
          <tbody>
            <tr>
              <td>Customer Name</td>
              <td key="1">{transaction.customerName}</td>
            </tr>
            <tr>
              <td>Customer Phone Number</td>
              <td>{transaction.customerPhone}</td>
            </tr>
            <tr>
              <td>Currency</td>
              <td>{transaction.currency}</td>
            </tr>
            <tr>
              <td>Price</td>
              <td>{transaction.amount}</td>
            </tr>
            <tr>
              <td>Remark</td>
              <td>{transaction.remark}</td>
            </tr>
          </tbody>
        </Table>
      ];
    } else {
      return null;
    }
  }
}
