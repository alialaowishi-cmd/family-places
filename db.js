import { db, storage } from './firebase-config.js';
import { 
  collection, addDoc, getDocs, getDoc, doc, 
  updateDoc, deleteDoc, query, where, orderBy, 
  serverTimestamp, setDoc 
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";

// ===== المدن =====
export async function getCities() {
  const snapshot = await getDocs(collection(db, 'cities'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addCity(cityName, userId, userName) {
  return await addDoc(collection(db, 'cities'), {
    name: cityName,
    createdBy: userId,
    createdByName: userName,
    createdAt: serverTimestamp()
  });
}

// ===== الأماكن =====
export async function addPlace(placeData) {
  return await addDoc(collection(db, 'places'), {
    ...placeData,
    createdAt: serverTimestamp()
  });
}

export async function getPlaces(cityName = null) {
  let q;
  if (cityName) {
    q = query(
      collection(db, 'places'), 
      where('city', '==', cityName),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'places'), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPlaceById(placeId) {
  const d = await getDoc(doc(db, 'places', placeId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() };
}

export async function deletePlace(placeId) {
  return await deleteDoc(doc(db, 'places', placeId));
}

// ===== المستخدمون =====
export async function addUser(userData) {
  return await setDoc(doc(db, 'users', userData.uid), {
    ...userData,
    createdAt: serverTimestamp()
  });
}

export async function getUser(uid) {
  const d = await getDoc(doc(db, 'users', uid));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() };
}

// ===== رفع الصور =====
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ===== طلبات التسجيل =====
export async function addRegistrationRequest(phone, name) {
  return await addDoc(collection(db, 'registrationRequests'), {
    phone: phone,
    name: name,
    status: 'pending',
    createdAt: serverTimestamp()
  });
}

export async function getRegistrationRequests() {
  const q = query(collection(db, 'registrationRequests'), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function approveRequest(requestId) {
  return await updateDoc(doc(db, 'registrationRequests', requestId), { status: 'approved' });
}
