import React, { useState, useEffect } from 'react';
import { storage, firestore } from '../firebase'; // Pastikan path sesuai dengan lokasi file firebase.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button, Form, Container, Row, Col, Card, Spinner, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../contexts/AuthContext';

const Galeri = () => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState('trainer smk otomotif');
  const [filePreview, setFilePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); // State untuk kategori filter
  const [loading, setLoading] = useState(false); // State untuk status loading
  const [showUploadForm, setShowUploadForm] = useState(false); // State untuk menampilkan form upload
  const [showRenameModal, setShowRenameModal] = useState(false); // State untuk menampilkan modal update nama
  const [renameFileId, setRenameFileId] = useState(null); // State untuk menyimpan id file yang akan diperbarui nama
  const [renameFileName, setRenameFileName] = useState(''); // State untuk menyimpan nama file yang baru
  const navigate = useNavigate(); // Menggunakan useNavigate untuk navigasi

  useEffect(() => {
    if (!currentUser) {
      navigate('/'); // Redirect ke halaman login jika tidak ada pengguna
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'karyawan') {
      navigate('/'); // Redirect ke halaman tidak berizin jika bukan admin
    } else {
      fetchFiles(); // Fetch files jika pengguna adalah admin
    }
  }, [currentUser, navigate]);

  const fetchFiles = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'galeri'));
    const filesArray = [];
    querySnapshot.forEach((doc) => {
      filesArray.push({ ...doc.data(), id: doc.id });
    });
    setFiles(filesArray);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true); // Set loading state to true

    const storageRef = ref(storage, `galeri/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      await addDoc(collection(firestore, 'galeri'), {
        name: fileName,
        url: fileURL,
        category: fileCategory,
        uploadedAt: new Date(),
        user: currentUser.email,
      });

      setFile(null);
      setFileName('');
      setFileCategory('trainer smk otomotif');
      setFilePreview(null);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setLoading(false); // Set loading state to false
      setShowUploadForm(false); // Hide upload form after upload
      fetchFiles(); // Refresh files list after upload
    }
  };

  const handleOpenRenameModal = (id, name) => {
    setRenameFileId(id);
    setRenameFileName(name);
    setShowRenameModal(true);
  };

  const handleCloseRenameModal = () => {
    setRenameFileId(null);
    setRenameFileName('');
    setShowRenameModal(false);
  };

  const handleUpdateFileName = async () => {
    try {
      await updateDoc(doc(firestore, 'galeri', renameFileId), {
        name: renameFileName,
      });
      toast.success('Nama file diperbarui!');
      fetchFiles(); // Refresh files list after update
    } catch (error) {
      toast.error('Gagal memperbarui nama file. Silakan coba lagi.');
    } finally {
      handleCloseRenameModal();
    }
  };

  const handleDeleteFile = async (id, url) => {
    try {
      // Hapus dokumen dari koleksi galeri di Firestore
      await deleteDoc(doc(firestore, 'galeri', id));

      // Hapus file dari Firebase Storage
      const storageRef = ref(storage, url); // Menggunakan url langsung sebagai parameter ref
      await deleteObject(storageRef);

      // Update state untuk memperbarui tampilan galeri setelah penghapusan
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      toast.success('File berhasil dihapus!');
    } catch (error) {
      toast.error('Gagal menghapus file. Silakan coba lagi.');
    }
  };

  const filteredFiles = selectedCategory === 'all' ? files : files.filter((file) => {
    if (selectedCategory === 'latest') {
      // Ambil file yang diunggah dalam 7 hari terakhir
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(file.uploadedAt.seconds * 1000) >= oneWeekAgo;
    }
    return file.category === selectedCategory || file.user === selectedCategory;
  });

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h1>Galeri</h1>
      {currentUser && (
        <>
          <Button
            variant="primary"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="mb-3"
          >
            {showUploadForm ? 'Batal Upload' : 'Upload File'}
          </Button>
          {showUploadForm && (
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleUpload}>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload file</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                  </Form.Group>
                  {filePreview && (
                    <div className="mb-3">
                      {file && file.type.includes('video') ? (
                        <video src={filePreview} controls width="100%" />
                      ) : (
                        <img
                          src={filePreview}
                          alt="Preview"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      )}
                    </div>
                  )}
                  <Form.Group controlId="formFileName" className="mb-3">
                    <Form.Label>Nama File</Form.Label>
                    <Form.Control
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formFileCategory" className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Form.Control
                      as="select"
                      value={fileCategory}
                      onChange={(e) => setFileCategory(e.target.value)}
                      required
                    >
                      <option value="trainer smk otomotif">Trainer SMK Otomotif</option>
                      <option value="elektro">Elektro</option>
                      <option value="microcontroller">Microcontroller</option>
                      <option value="robotik">Robotik</option>
                      <option value="programming">Programming</option>
                      <option value="lainnya">Lainnya</option>
                    </Form.Control>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Upload'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </>
      )}
      <Form.Group controlId="formCategoryFilter" className="mb-3">
        <Form.Label>Filter Kategori</Form.Label>
        <Form.Control
          as="select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Semua Kategori</option>
          <option value="latest">Terbaru</option>
          <option value="trainer smk otomotif">Trainer SMK Otomotif</option>
          <option value="elektro">Elektro</option>
          <option value="microcontroller">Microcontroller</option>
          <option value="robotik">Robotik</option>
          <option value="programming">Programming</option>
          <option value="lainnya">Lainnya</option>
          {currentUser && <option value={currentUser.email}>Diunggah oleh Saya</option>}
        </Form.Control>
      </Form.Group>
      <Row className="mt-4">
        {filteredFiles.map((file) => (
          <Col md={4} key={file.id} className="mb-3">
            <Card>
              <a href={file.url} target="_blank">
                {file.url.includes('.mp4') ? (
                  <video className="card-img-top" src={file.url} controls style={{ maxHeight: '200px' }} />
                ) : (
                  <Card.Img
                    variant="top"
                    src={file.url} // Memperbaiki pengambilan URL gambar dari array imageURLs
                    className="product-image"
                    style={{ height: '300px', objectFit: 'cover' }} // Atur tinggi gambar dan penyesuaian ukuran di sini
                  />
                )}
              </a>
              <Card.Body>
                <Card.Title>{file.name}</Card.Title>
                <Card.Text>Kategori: {file.category}</Card.Text>
                <Card.Text>Uploaded by: {file.user}</Card.Text>
                {currentUser && currentUser.email === file.user && (
                  <>
                    <Button variant="primary" onClick={() => handleOpenRenameModal(file.id, file.name)}>
                      Update Nama
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteFile(file.id, file.url)} className="mt-2">
                      Hapus
                    </Button>
                  </>
                )}
                {currentUser && currentUser.role === 'admin' && (
                  <>
                    <Button variant="primary" onClick={() => handleOpenRenameModal(file.id, file.name)}>
                      Update Nama
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteFile(file.id, file.url)} className="mt-2">
                      Hapus
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal Update Nama */}
      <Modal show={showRenameModal} onHide={handleCloseRenameModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Nama File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formRenameFileName" className="mb-3">
            <Form.Label>Nama File Baru</Form.Label>
            <Form.Control
              type="text"
              value={renameFileName}
              onChange={(e) => setRenameFileName(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRenameModal}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleUpdateFileName}>
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Galeri;
