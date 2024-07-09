import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Image, Spinner, NavDropdown, Badge } from 'react-bootstrap';
import { FaGoogle, FaBoxOpen, FaBookOpen, FaInfoCircle, FaShoppingCart, FaImages } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, googleAuthProvider } from '../firebase'; // Sesuaikan path jika perlu

const logoUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiwQWud4tcyIKBjtzmYBXpQrYpe36G29YLZ7d6tUsKX9OksP4bp98JIWSH_1UmxR4Zo43a9dcdWFrkredPHptwF4SxISbnKv6m6RMSjWQR09O6Xv9qbcaDfYHtPZ8GrFxBOsoLBuow08EkX/s1600/header.png';

const AppNavbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk menunjukkan apakah sedang loading atau tidak
  const [cartItemCount, setCartItemCount] = useState(0); // State untuk jumlah item di keranjang
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
          });
        }

        // Hitung jumlah item di keranjang untuk pengguna yang sedang login
        const cartQuery = firestore.collection('keranjang').where('userId', '==', userAuth.uid);
        const cartSnapshot = await cartQuery.get();
        setCartItemCount(cartSnapshot.size); // Set jumlah item di keranjang
      } else {
        setUser(null);
        setCartItemCount(0); // Reset jumlah item di keranjang jika tidak ada pengguna yang login
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
            role: 'user' // Misalnya, tambahkan peran pengguna di sini
          });
        }

        // Hitung jumlah item di keranjang untuk pengguna yang baru login
        const cartQuery = firestore.collection('keranjang').where('userId', '==', user.uid);
        const cartSnapshot = await cartQuery.get();
        setCartItemCount(cartSnapshot.size); // Set jumlah item di keranjang
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
      setCartItemCount(0); // Reset jumlah item di keranjang
      navigate('/'); // Redirect to home or another page after logout

      setLoading(false); // Selesai loading setelah proses selesai
    } catch (error) {
      console.error('Error signing out:', error.message);
      setLoading(false); // Selesai loading jika ada error
    }
  };

  const handleCartClick = () => {
    navigate('/cart'); // Redirect to Cart page
  };

  const isAdmin = user && user.role === 'admin'; // Periksa apakah pengguna memiliki peran admin
  const isEmployee = (user && user.role === 'karyawan') || (user && user.role === 'admin'); // Periksa apakah pengguna memiliki peran karyawan atau admin

  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          <Image src={logoUrl} alt="Trainersmk.id" style={{ height: '30px', marginRight: '10px' }} />
          Trainersmk.id
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="/">
              <FaBoxOpen /> Produk
            </Nav.Link>
            <Nav.Link href="/online-course">
              <FaBookOpen /> Online Course
            </Nav.Link>
            <Nav.Link href="/about">
              <FaInfoCircle /> Tentang Kami
            </Nav.Link>
            {isEmployee && (
              <Nav.Link href="/karyawan/galeri">
                <FaImages /> Galeri
              </Nav.Link>
            )}
            {loading ? ( // Tampilkan spinner atau loading state saat loading
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            ) : user ? (
              <>
                <Nav.Link href="/profile">
                  {user.displayName}
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName}
                      roundedCircle
                      style={{ width: '30px', marginLeft: '10px' }}
                    />
                  )}
                </Nav.Link>
                {isAdmin && (
                  <NavDropdown title="Admin" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/admin/produk">Produk</NavDropdown.Item>
                    <NavDropdown.Item href="/admin/userlist">User List</NavDropdown.Item>
                    <NavDropdown.Item href="/admin/produklist">Produk List</NavDropdown.Item>
                  </NavDropdown>
                )}
                <Button variant="outline-primary" className="ml-2" onClick={handleCartClick}>
                  <FaShoppingCart /> Keranjang{''}
                  {cartItemCount > 0 && <Badge variant="primary">{cartItemCount}</Badge>}
                </Button>
                <Button variant="outline-primary" onClick={handleLogout} className="ml-2">
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline-primary" onClick={handleLogin} className="ml-2">
                <FaGoogle /> Login with Google
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
