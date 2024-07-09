import React, { useState, useEffect } from 'react';
import { Table, Container, Button, Form } from 'react-bootstrap';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // Pastikan path sesuai
import { useNavigate } from 'react-router-dom'; // Ubah dari useHistory ke useNavigate

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // State untuk menyimpan pengguna yang dipilih untuk mengubah peran
  const [newRole, setNewRole] = useState(''); // State untuk menyimpan peran baru
  const { currentUser } = useAuth(); // Dapatkan pengguna saat ini
  const navigate = useNavigate(); // Gantikan useHistory dengan useNavigate

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore.collection('users').get();
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // Fungsi untuk mengubah peran pengguna
  const changeUserRole = async () => {
    try {
      await firestore.collection('users').doc(selectedUser.id).update({
        role: newRole
      });
      // Update state atau refresh data pengguna setelah perubahan
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      // Kosongkan state setelah selesai
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error.message);
    }
  };

  // Redirect pengguna jika tidak ada currentUser atau bukan admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Redirect ke halaman login jika tidak ada pengguna
    } else if (currentUser.role !== 'admin') {
      navigate('/'); // Redirect ke halaman tidak berizin jika bukan admin
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Container className="mt-5">Loading...</Container>;
  }

  return (
    <Container className="mt-5">
      <h2>Daftar Pengguna</h2>
      <Table striped bordered hover responsive="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama Pengguna</th>
            <th>Email</th>
            <th>Peran</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="primary" onClick={() => setSelectedUser(user)}>
                  Ubah Peran
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal untuk mengubah peran pengguna */}
      {selectedUser && (
        <Container className="mt-3">
          <h4>Ubah Peran Pengguna</h4>
          <Form.Group>
            <Form.Label>Pilih Peran Baru:</Form.Label>
            <Form.Control
              as="select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="karyawan">Karyawan</option>
            </Form.Control>
          </Form.Group>
          <Button variant="success" onClick={changeUserRole}>
            Simpan Perubahan
          </Button>
        </Container>
      )}
    </Container>
  );
};

export default UserList;
