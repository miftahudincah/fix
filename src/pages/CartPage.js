import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Card } from 'react-bootstrap';
import { firestore } from '../firebase'; // Sesuaikan path jika perlu
import { FaShoppingCart } from 'react-icons/fa'; // Tambahkan ikon shopping cart

const Keranjang = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (user) {
          const cartQuery = firestore.collection('keranjang').where('userId', '==', user.uid);
          const snapshot = await cartQuery.get();
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCartItems(items);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [user]); // Memastikan efek hanya berjalan saat user berubah

  const handleRemoveItem = async (itemId) => {
    try {
      await firestore.collection('keranjang').doc(itemId).delete();
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      console.log('Item removed from cart.');
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleIncrement = async (itemId) => {
    try {
      const itemRef = firestore.collection('keranjang').doc(itemId);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        console.error('Item not found in cart.');
        return;
      }

      const currentItem = itemDoc.data();
      const updatedQuantity = currentItem.jumlah + 1;

      await itemRef.update({ jumlah: updatedQuantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, jumlah: updatedQuantity } : item
        )
      );

      console.log('Item quantity incremented.');
    } catch (error) {
      console.error('Error incrementing item quantity:', error);
    }
  };

  const handleDecrement = async (itemId) => {
    try {
      const itemRef = firestore.collection('keranjang').doc(itemId);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        console.error('Item not found in cart.');
        return;
      }

      const currentItem = itemDoc.data();
      const updatedQuantity = currentItem.jumlah - 1;

      if (updatedQuantity <= 0) {
        // Jika jumlah item menjadi 0 atau negatif, hapus item dari keranjang
        await itemRef.delete();
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        await itemRef.update({ jumlah: updatedQuantity });
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, jumlah: updatedQuantity } : item
          )
        );
      }

      console.log('Item quantity decremented.');
    } catch (error) {
      console.error('Error decrementing item quantity:', error);
    }
  };

  const handleCheckout = () => {
    // Logika untuk proses checkout bisa ditambahkan di sini
    console.log('Checkout logic goes here...');
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(itemId)
        ? prevSelectedItems.filter(id => id !== itemId)
        : [...prevSelectedItems, itemId]
    );
  };

  // Menghitung total harga untuk item yang dicentang
  const totalPrice = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((acc, item) => acc + (item.productPrice * item.jumlah), 0);

  return (
    <Container className="mt-4">
      <h2>Keranjang Belanja <FaShoppingCart /></h2>
      <Table striped bordered hover>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={item.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  label={item.productName}
                />
              </td>
              <td>{item.jumlah ? item.jumlah : 'Tidak Valid'}</td>
              <td>Rp. {item.productPrice}</td>
              <td>
                <Button variant="primary" onClick={() => handleIncrement(item.id)}>
                  +
                </Button>{' '}
                <Button variant="secondary" onClick={() => handleDecrement(item.id)}>
                  -
                </Button>{' '}
                <Button variant="danger" onClick={() => handleRemoveItem(item.id)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Card className="mt-3">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <Card.Title>Total Harga</Card.Title>
          <Card.Text className="fs-4 fw-bold text-success">Rp. {totalPrice.toFixed(2)}</Card.Text>
        </Card.Body>
      </Card>
      <Button variant="primary" className="mt-3" onClick={handleCheckout}>
        Checkout
      </Button>
    </Container>
  );
};

export default Keranjang;
