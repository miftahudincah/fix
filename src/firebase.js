import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'
const firebaseConfig = {
    apiKey: "AIzaSyBBvljkYLrcxTf_cZbgSvWYcKKFEb0nE5M",
    authDomain: "trainersmk-428403.firebaseapp.com",
    databaseURL: "https://trainersmk-428403-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "trainersmk-428403",
    storageBucket: "trainersmk-428403.appspot.com",
    messagingSenderId: "482660643675",
    appId: "1:482660643675:web:8ca11fb6ae8d9cf4a1607e",
    measurementId: "G-8KXM02H5MH"
  };
  

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export const firestore = app.firestore();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const storage = app.storage();