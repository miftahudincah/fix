import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Import file CSS global jika diperlukan
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import file CSS Bootstrap
import { AuthProvider } from './contexts/AuthContext'; // Pastikan path sesuai

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
