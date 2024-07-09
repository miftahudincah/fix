import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Carousel, Button, Form } from 'react-bootstrap';
import { firestore, auth } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DetailProduk = () => {
  const { id } = useParams();
  const [produk, setProduk] = useState(null);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [keranjangPengguna, setKeranjangPengguna] = useState([]);

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const produkRef = firestore.collection('produk').doc(id);
        const doc = await produkRef.get();
        if (!doc.exists) {
          console.log('Produk not found!');
        } else {
          setProduk({ ...doc.data(), id: doc.id });
        }
      } catch (error) {
        console.error('Error fetching produk: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, [id]);

  useEffect(() => {
    const fetchKeranjangPengguna = async () => {
      try {
        const keranjangSnapshot = await firestore.collection('keranjang')
          .where('userId', '==', user.uid)
          .get();

        const keranjangData = keranjangSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setKeranjangPengguna(keranjangData);
      } catch (error) {
        console.error('Error fetching user cart:', error);
      }
    };

    if (user) {
      fetchKeranjangPengguna();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        setUser(userAuth);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBeliClick = async () => {
    try {
      if (!user) {
        console.log('User belum login!');
        return;
      }

      const existingProduct = keranjangPengguna.find(item => item.productId === id);

      if (existingProduct) {
        await firestore.collection('keranjang').doc(existingProduct.id).update({
          jumlah: existingProduct.jumlah + quantity
        });
      } else {
        await firestore.collection('keranjang').add({
          productId: id,
          productName: produk.nama,
          productPrice: produk.harga,
          jumlah: quantity,
          timestamp: new Date(),
          userId: user.uid,
          userEmail: user.email
        });
      }

      toast.success('Produk telah dimasukkan ke keranjang!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      console.log('Produk telah dimasukkan ke keranjang!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return <Container className="mt-4">Loading...</Container>;
  }

  return (
    <Container className="mt-4">
      <h2>Detail Produk</h2>
      <Card style={{ width: '18rem', margin: '0 auto' }}>
        {produk.imageURLs.length > 1 ? (
          <Carousel>
            {produk.imageURLs.map((url, index) => (
              <Carousel.Item key={index} style={{ backgroundColor: '#f8f9fa' }}>
                <img
                  className="d-block w-100"
                  src={url}
                  alt={`Slide ${index}`}
                  style={{ height: '300px', objectFit: 'cover', filter: 'brightness(110%)' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <Card.Img
            variant="top"
            src={produk.imageURLs[0]}
            className="product-image"
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
        )}
        <Card.Body>
          <Card.Title>{produk.nama}</Card.Title>
          <Card.Text>{produk.deskripsi}</Card.Text>
          <Card.Text>Harga: ${produk.harga}</Card.Text>
          <Form.Group>
            <Form.Label>Jumlah</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleBeliClick}>
            Masukan ke Keranjang
          </Button>
        </Card.Body>
      </Card>
      <ToastContainer />
    </Container>
  );
};

export default DetailProduk;
