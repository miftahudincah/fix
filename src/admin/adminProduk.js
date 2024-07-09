import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Spinner, Toast } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { storage, firestore } from '../firebase'; // Pastikan path dengan lokasi file firebase.js
import { useAuth } from '../contexts/AuthContext';

const AdminProduk = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [gambar, setGambar] = useState([]);
  const [previewGambar, setPreviewGambar] = useState([]); // State untuk menyimpan preview gambar
  const [kategori, setKategori] = useState('Mikrokontroler'); // Default kategori yang dipilih
  const [loading, setLoading] = useState(false); // State untuk menunjukkan loading
  const [showToast, setShowToast] = useState(false); // State untuk menunjukkan Toast
  const [toastMessage, setToastMessage] = useState(''); // Pesan yang ditampilkan di Toast

  // Mengubah gambar yang dipilih menjadi URL preview
  const handleGambarChange = (e) => {
    const files = Array.from(e.target.files);
    setGambar(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewGambar(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); // Mulai loading

      if (!nama || !deskripsi || !harga || gambar.length === 0) {
        setToastMessage('Mohon lengkapi semua field!');
        setShowToast(true);
        setLoading(false); // Hentikan loading jika ada error
        return;
      }

      const imageURLs = [];

      // Simpan semua gambar ke Firebase Storage
      const storageRef = storage.ref();
      await Promise.all(gambar.map(async (file) => {
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        const imageURL = await fileRef.getDownloadURL();
        imageURLs.push(imageURL);
      }));

      // Simpan data produk beserta semua URL gambar ke Firestore
      await firestore.collection('produk').add({
        nama,
        deskripsi,
        harga: parseInt(harga),
        imageURLs,
        kategori // Menyimpan kategori yang dipilih
      });

      // Reset form setelah submit berhasil
      setNama('');
      setDeskripsi('');
      setHarga('');
      setGambar([]);
      setPreviewGambar([]); // Reset preview gambar
      setKategori('Mikrokontroler'); // Setel kembali kategori ke default
      setLoading(false); // Selesai loading setelah submit berhasil
      setToastMessage('Produk berhasil ditambahkan!');
      setShowToast(true); // Tampilkan Toast sukses
    } catch (error) {
      console.error('Error adding product: ', error);
      setToastMessage('Gagal menambahkan produk. Silakan coba lagi.');
      setShowToast(true); // Tampilkan Toast error
      setLoading(false); // Selesai loading jika ada error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore.collection('produk').get();
        // eslint-disable-next-line no-unused-vars
        const produkData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // setProdukList(produkData); // Pastikan Anda memiliki state untuk produk list jika diperlukan
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchData();
    } else {
      navigate('/'); // Redirect ke halaman login jika tidak ada pengguna atau bukan admin
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Container className="mt-5">Loading...</Container>; // Tampilkan loading atau pesan lain sesuai kebutuhan
  }

  return (
    <div className="mt-4">
      <h2>Admin Produk</h2>

      {/* Toast untuk menampilkan pesan sukses atau error */}
      <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
        <Toast.Header>
          <strong className="mr-auto">Notifikasi</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="namaProduk">
          <Form.Label>Nama Produk</Form.Label>
          <Form.Control type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="deskripsiProduk">
          <Form.Label>Deskripsi</Form.Label>
          <Form.Control as="textarea" rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="hargaProduk">
          <Form.Label>Harga</Form.Label>
          <Form.Control type="number" value={harga} onChange={(e) => setHarga(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="gambarProduk">
          <Form.Label>Gambar Produk</Form.Label>
          <Form.Control type="file" onChange={handleGambarChange} multiple required />
          <div className="mt-2">
            {previewGambar.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index}`}
                className="img-preview mr-2 mb-2"
                style={{ maxWidth: '200px', maxHeight: '200px' }} // Contoh pengaturan ukuran gambar
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group controlId="kategoriProduk">
          <Form.Label>Kategori</Form.Label>
          <Form.Control as="select" value={kategori} onChange={(e) => setKategori(e.target.value)} required>
            <option value="Mikrokontroler">Mikrokontroler</option>
            <option value="IoT">IoT</option>
            <option value="Sensor">Sensor</option>
            <option value="Trainer SMK Otomotif">Trainer SMK Otomotif</option>
            <option value="Trainer SMK Elektronika">Trainer SMK Elektronika</option>
            <option value="Trainer SMK Listrik">Trainer SMK Listrik</option>
            <option value="Trainer SMK Microcontroller">Trainer SMK Microcontroller</option>
            {/* Tambahkan pilihan kategori lainnya di sini */}
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit">
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ml-2">Menyimpan...</span>
            </>
          ) : (
            'Simpan Produk'
          )}
        </Button>

        <p>
          <Link to="/produk-list">
            <Button variant="info" className="mr-2">
              Lihat Daftar Produk
            </Button>
          </Link>
        </p>
      </Form>
    </div>
  );
};

export default AdminProduk;
