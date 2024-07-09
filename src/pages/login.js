import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
import { auth, googleAuthProvider, firestore } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Masuk dengan email dan password
      const result = await auth.signInWithEmailAndPassword(email, password);
      const { user } = result;

      // Simpan info pengguna dan peran ke Firestore
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
          await userRef.set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'user', // Atur peran default di sini
          });
        } else {
          // Perbarui peran pengguna jika diperlukan
          await userRef.update({
            role: 'user', // Pastikan peran disetel di sini
          });
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await auth.signInWithPopup(googleAuthProvider);
      const { user } = result;

      // Simpan info pengguna dan peran ke Firestore
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
          await userRef.set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'user', // Atur peran default di sini
          });
        } else {
          // Perbarui peran pengguna jika diperlukan
          await userRef.update({
            role: 'user', // Pastikan peran disetel di sini
          });
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="text-center mt-5">
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Alamat Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Kata Sandi</Form.Label>
          <Form.Control
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mr-2">
          Masuk
        </Button>
        <Button variant="outline-primary" onClick={handleGoogleLogin}>
          <FaGoogle /> Masuk dengan Google
        </Button>
      </Form>
    </div>
  );
};

export default Login;
