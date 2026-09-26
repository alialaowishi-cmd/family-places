import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
  authDomain: "ali-alaowishi.firebaseapp.com",
  projectId: "ali-alaowishi",
  storageBucket: "ali-alaowishi.firebasestorage.app",
  messagingSenderId: "536583940962",
  appId: "1:536583940962:web:YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
