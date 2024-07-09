import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
const Register = () => {
  const handleRegister = () => {
    // Fungsi untuk meng-handle proses registrasi
    console.log('Proses registrasi...');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md="auto">
          <h2>Register</h2>
          <Form>
            <Form.Group controlId="formBasicName">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control type="text" placeholder="Masukkan nama lengkap Anda" />
            </Form.Group>

            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Masukkan email Anda" />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Form.Group controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" placeholder="Confirm Password" />
            </Form.Group>

            <Button variant="primary" type="submit" onClick={handleRegister} block>
              Register
            </Button>
            <p className="text-center">or</p>

            <Button variant="outline-primary" href="/auth/google" block>
              <FaGoogle /> Login with Google
            </Button>
          </Form>
          <p className="mt-3 text-center">
            Sudah punya akun? <a href="/login">Login disini</a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
