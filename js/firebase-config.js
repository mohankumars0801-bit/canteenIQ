import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Using the Firebase project configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyD3ufLgXr9liuAVsMKOI_JfX0vgbJN0b2c",
  authDomain: "canteeniq-d21fc.firebaseapp.com",
  projectId: "canteeniq-d21fc",
  storageBucket: "canteeniq-d21fc.firebasestorage.app",
  messagingSenderId: "653857525257",
  appId: "1:653857525257:web:1863ad94f429e1810eb2d8",
  measurementId: "G-WDX50QHDQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
