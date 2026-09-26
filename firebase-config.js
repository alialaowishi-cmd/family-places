import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
  authDomain: "ali-alaowishi.firebaseapp.com",
  projectId: "ali-alaowishi",
  storageBucket: "ali-alaowishi.firebasestorage.app",
  messagingSenderId: "536583940962",
  appId: "1:536583940962:web:1b101ab662b21e18d3da3b",
  measurementId: "G-01L9L5FS9F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
