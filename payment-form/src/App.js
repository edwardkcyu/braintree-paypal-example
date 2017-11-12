import React, { Component } from "react";
import { Navbar, Nav, NavItem } from "react-bootstrap";

import { IndexLinkContainer } from "react-router-bootstrap";
import { BrowserRouter as Router, Route } from "react-router-dom";

import PaymentForm from "./components/PaymentForm";
import CheckForm from "./components/CheckForm";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>Credit Card Payment</Navbar.Brand>
            </Navbar.Header>
            <Nav>
              <IndexLinkContainer to="/">
                <NavItem eventKey={1}>Create Payment</NavItem>
              </IndexLinkContainer>
              <IndexLinkContainer to="/check">
                <NavItem eventKey={2}>Check Record</NavItem>
              </IndexLinkContainer>
            </Nav>
          </Navbar>
          <Route exact path="/" component={PaymentForm} />
          <Route path="/check" component={CheckForm} />
        </div>
      </Router>
    );
  }
}

export default App;
