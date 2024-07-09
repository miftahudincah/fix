import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Toast } from 'react-bootstrap';
import { firestore, storage } from '../firebase'; // Sesuaikan path dengan lokasi file firebase.js
import { useAuth } from '../contexts/AuthContext'; // Pastikan path sesuai dengan lokasi file AuthContext.js
import { useNavigate } from 'react-router-dom'; // Menggunakan useNavigate

const ListProduk = () => {
  const [produkList, setProdukList] = useState([]);
  const { currentUser } = useAuth(); // Dapatkan pengguna saat ini
  const navigate = useNavigate(); // Gantikan useHistory dengan useNavigate

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // Default type adalah success

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore.collection('produk').get();
        const produkData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProdukList(produkData);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Redirect pengguna jika tidak ada currentUser atau bukan admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/'); // Redirect ke halaman login jika tidak ada pengguna
    } else if (currentUser.role !== 'admin') {
      navigate('/'); // Redirect ke halaman tidak berizin jika bukan admin
    }
  }, [currentUser, navigate]);

  const handleDeleteProduk = async (id, imageURL) => {
    try {
      // Hapus produk dari Firestore
      await firestore.collection('produk').doc(id).delete();

      // Hapus gambar dari Firebase Storage (opsional, tergantung kebutuhan)
      if (imageURL) {
        const storageRef = storage.refFromURL(imageURL);
        await storageRef.delete();
      }

      // Update state untuk memperbarui daftar produk setelah penghapusan
      setProdukList(prevList => prevList.filter(produk => produk.id !== id));
      setToastType('success');
      setToastMessage('Produk berhasil dihapus!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting product: ', error);
      setToastType('error');
      setToastMessage('Gagal menghapus produk. Silakan coba lagi.');
      setShowToast(true);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Daftar Produk</h2>

      {/* Toast untuk menampilkan pesan sukses atau error */}
      <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastType === 'success' ? 'success' : 'danger'}>
        <Toast.Header>
          <strong className="mr-auto">Notifikasi</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Row>
        {produkList.map(produk => (
          <Col key={produk.id} sm={6} md={4} lg={3} className="mb-4">
            <Card>
              <div className="product-image-container">
                <Card.Img variant="top" src={produk.imageURL} className="product-image" />
              </div>
              <Card.Body>
                <Card.Title>{produk.nama}</Card.Title>
                <Card.Text>{produk.deskripsi}</Card.Text>
                <Card.Text>Harga: ${produk.harga}</Card.Text>
                <Button variant="danger" onClick={() => handleDeleteProduk(produk.id, produk.imageURL)}>Hapus</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ListProduk;
