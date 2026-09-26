import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
  authDomain: "ali-alaowishi.firebaseapp.com",
  projectId: "ali-alaowishi",
  storageBucket: "ali-alaowishi.firebasestorage.app",
  messagingSenderId: "536583940962",
  appId: "1:536585096258:web:4d4e8c037e4b5d6a7f8e90"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
