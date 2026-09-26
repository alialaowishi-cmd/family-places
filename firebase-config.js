// ==========================================
// إعدادات الاتصال بـ Firebase
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
  authDomain: "ali-alaowishi.firebaseapp.com",
  projectId: "ali-alaowishi",
  storageBucket: "ali-alaowishi.firebasestorage.app",
  messagingSenderId: "536583940962",
  appId: "1:536583940962:web:1b5c47a739c58b8f4d3c2e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
