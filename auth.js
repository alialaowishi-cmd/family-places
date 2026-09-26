import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
  authDomain: "ali-alaowishi.firebaseapp.com",
  projectId: "ali-alaowishi",
  storageBucket: "ali-alaowishi.firebasestorage.app",
  messagingSenderId: "536583940962",
  appId: "1:536583940962:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const db = getFirebase(app);
const auth = getAuth(app);
const storage = getStorage(app);

const ADMIN_EMAIL = "Alihossin28@gmail.com";
const ADMIN_PASSWORD = "admin123";

// === دوال المستخدم ===
function getCurrentUser() {
  try {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

function isAdmin() {
  const user = getCurrentUser();
  return user?.isAdmin === true;
}

// === دوال المصادقة ===
async function loginWithPhone(phone) {
  const q = query(collection(db, 'users'), where('phone', '==', phone), where('approved', '==', true));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const userData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    setCurrentUser(userData);
    return { success: true };
  }
  return { success: false, error: 'رقم الجوال غير مسجل أو غير مُوافق عليه' };
}

async function loginWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      setCurrentUser(userData);
      return { success: true };
    }
    return { success: false, error: 'المستخدم غير موجود' };
  } catch (e) {
    return { success: false, error: 'بريد أو كلمة مرور غير صحيحة' };
  }
}

async function adminLogin(password) {
  if (password === 'admin123') {
    const adminData = {
      id: 'admin',
      name: 'المشرف',
      email: ADMIN_EMAIL,
      phone: '0500509134',
      isAdmin: true,
      approved: true
    };
    setCurrentUser(adminData);
    return { success: true };
  }
  return { success: false, error: 'كلمة المرور خاطئة' };
}

function logout() {
  localStorage.removeItem('currentUser');
  signOut(auth);
}

// === دوال الأماكن ===
async function getAllPlaces() {
  const snapshot = await getDocs(query(collection(db, 'places'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addPlace(data) {
  const user = getCurrentUser();
  await addDoc(collection(db, 'places'), {
    ...data,
    createdAt: new Date(),
    createdBy: user?.phone || user?.email || 'مجهول'
  });
}

async function updatePlace(id, data) {
  const docRef = doc(db, 'places', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
}

async function deletePlace(id) {
  await deleteDoc(doc(db, 'places', id));
}

async function getPlaceById(id) {
  const docSnap = await getDocs(doc(db, 'places', id));
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
}

// === دوال المدن ===
async function getCities() {
  const places = await getAllPlaces();
  const cityNames = [...new Set(places.map(p => p.city).filter(c => c))];
  return cityNames.map(name => ({ name }));
}

async function addCity(cityName) {
  const places = await getAllPlaces();
  const exists = places.some(p => p.city === cityName);
  if (!exists) {
    await addDoc(collection(db, 'places'), {
      name: '',
      city: cityName,
      category: '',
      createdAt: new Date(),
      createdBy: getCurrentUser()?.phone || 'admin',
      isCityOnly: true
    });
  }
}

async function getPlacesByCity(cityName) {
  const snapshot = await getDocs(query(
    collection(db, 'places'),
    where('city', '==', cityName),
    where('isCityOnly', '!=', true),
    orderBy('createdAt', 'desc')
  ));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// === رفع الصور ===
async function uploadImage(file) {
  const storageRef = ref(storage, `places/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url };
}

// === دوال المستخدمين ===
async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addUserByAdmin(name, phone, email = '') {
  await addDoc(collection(db, 'users'), {
    name,
    phone,
    email,
    approved: true,
    createdAt: new Date()
  });
}

async function requestRegistration(name, phone, email = '') {
  await addDoc(collection(db, 'users'), {
    name,
    phone,
    email,
    approved: false,
    createdAt: new Date()
  });
}

async function approveUser(id) {
  await updateDoc(doc(db, 'users', id), { approved: true });
}

async function deleteUser(id) {
  await deleteDoc(doc(db, 'users', id));
}

async function updateUserProfile(data) {
  const user = getCurrentUser();
  if (!user) return;
  const docRef = doc(db, 'users', user.id);
  await updateDoc(docRef, data);
  setCurrentUser({ ...user, ...data });
}

window.auth = {
  getCurrentUser, setCurrentUser, isUserLoggedIn, isAdmin,
  loginWithPhone, loginWithEmail, adminLogin, logout,
  getAllPlaces, addPlace, updatePlace, deletePlace, getPlaceById,
  getCities, addCity, getPlacesByCity,
  uploadImage, getAllUsers, addUserByAdmin, requestRegistration,
  approveUser, deleteUser, updateUserProfile
};

export {
  getCurrentUser, setCurrentUser, isUserLoggedIn, isAdmin,
  loginWithPhone, loginWithEmail, adminLogin, logout,
  getAllPlaces, addPlace, updatePlace, deletePlace, getPlaceById,
  getCities, addCity, getPlacesByCity,
  uploadImage, getAllUsers, addUserByAdmin, requestRegistration,
  approveUser, deleteUser, updateUserProfile
};
