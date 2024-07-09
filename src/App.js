import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { auth } from './firebase'; // Pastikan path sesuai dengan lokasi file firebase.js
import AboutUs from './pages/AboutUs';
import AppNavbar from './components/Navbar';
import Produk from './pages/Produk';
import Login from './pages/login';
import Register from './pages/register';
import UserList from './admin/adminuserlist';
import AdminProduk from './admin/adminProduk';
import ListProduk from './admin/adminProdukList';
import ProfilePage from './pages/profile';
import DetailProduk from './pages/DetailProduk'; // Import halaman detail produk
import CartPage from './pages/CartPage';
import Galeri  from './pages/Galeri'; // Perbaiki path jika diperlukan

const App = () => {
  const [user, setUser] = useState(null); // State untuk menyimpan informasi pengguna
  const [loading, setLoading] = useState(true); // State untuk menunjukkan apakah sedang loading atau tidak

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        setUser(userAuth); // Set informasi pengguna saat login
      } else {
        setUser(null); // Kosongkan informasi pengguna saat logout
      }
      setLoading(false); // Selesai loading setelah mendapatkan informasi pengguna
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Container className="mt-4">Loading...</Container>; // Tampilkan pesan loading jika masih memuat informasi pengguna
  }

  return (
    <Router>
      <AppNavbar />
      <Container>
        <Routes>
          <Route path="/" element={<Produk />} />
          <Route path="/karyawan/galeri" element={<Galeri  />} />
          <Route path="/admin/userlist" element={<UserList />} />
          <Route path="/admin/produk" element={<AdminProduk />} />
          <Route path="/admin/produklist" element={<ListProduk />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/About" element={<AboutUs />} />
          <Route path="/produk/:id" element={<DetailProduk />} /> {/* Route untuk halaman detail produk */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage user={user} />} /> {/* Pass user prop to CartPage */}
          {/* Tambahkan rute untuk halaman lain */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
