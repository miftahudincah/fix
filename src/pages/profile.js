import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Spinner } from 'react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, googleAuthProvider } from '../firebase'; // Sesuaikan path jika perlu

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk menunjukkan apakah sedang loading atau tidak
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      setLoading(true); // Mulai loading

      if (userAuth) {
        const userRef = firestore.collection('users').doc(userAuth.uid);
        const snapshot = await userRef.get();
        if (snapshot.exists) {
          setUser(snapshot.data());
        } else {
          setUser({
            displayName: userAuth.displayName,
            email: userAuth.email,
            photoURL: userAuth.photoURL,
            role: 'user', // Set default role jika tidak ada informasi role di Firebase
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false); // Selesai loading setelah proses selesai
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true); // Mulai loading

      const result = await auth.signInWithPopup(googleAuthProvider);
      const { user } = result;
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);
        const snapshot = await userRef.get();
        if (!snapshot.exists) {
          await userRef.set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'user', // Set default role saat pertama kali login
          });
        }
        navigate('/profile'); // Redirect ke halaman profil setelah login berhasil
      }

      setLoading(false); // Selesai loading setelah proses selesai
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      setLoading(false); // Selesai loading jika ada error
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true); // Mulai loading

      await auth.signOut();
      setUser(null); // Clear user state
      navigate('/'); // Redirect to home or another page after logout

      setLoading(false); // Selesai loading setelah proses selesai
    } catch (error) {
      console.error('Error signing out:', error.message);
      setLoading(false); // Selesai loading jika ada error
    }
  };

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Profil Pengguna</h2>
      <hr />
      {user ? (
        <>
          <Image src={user.photoURL} roundedCircle style={{ width: '100px', marginBottom: '10px' }} />
          <h4>Nama: {user.displayName}</h4>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <Button variant="outline-primary" onClick={handleLogout}>
            Logout
          </Button>
        </>
      ) : (
        <Button variant="outline-primary" onClick={handleLogin}>
          <FaGoogle /> Login dengan Google
        </Button>
      )}
    </Container>
  );
};

export default ProfilePage;
