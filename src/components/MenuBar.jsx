import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const MenuBar = () => {
  return (
    <Navbar expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand href="/">Stream Demo</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link href="/streaming">Streaming</Nav.Link>
            <Nav.Link href="/static">Static</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MenuBar;
