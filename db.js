import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// ===== المدن =====
export async function getCities() {
  try {
    const snapshot = await getDocs(collection(db, 'cities'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('❌ خطأ في جلب المدن:', e);
    throw e;
  }
}

export async function addCity(cityName, userId, userName) {
  try {
    return await addDoc(collection(db, 'cities'), {
      name: cityName,
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error('❌ خطأ في إضافة مدينة:', e);
    throw e;
  }
}

// ===== الأماكن =====
export async function addPlace(placeData) {
  try {
    return await addDoc(collection(db, 'places'), {
      ...placeData,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error('❌ خطأ في إضافة مكان:', e);
    throw e;
  }
}

export async function getPlaces(cityName = null) {
  try {
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
  } catch (e) {
    console.error('❌ خطأ في جلب الأماكن:', e);
    throw e;
  }
}

export async function getPlaceById(placeId) {
  try {
    const d = await getDoc(doc(db, 'places', placeId));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  } catch (e) {
    console.error('❌ خطأ في جلب المكان:', e);
    throw e;
  }
}

export async function updatePlace(placeId, data) {
  try {
    return await updateDoc(doc(db, 'places', placeId), data);
  } catch (e) {
    console.error('❌ خطأ في تحديث المكان:', e);
    throw e;
  }
}

export async function deletePlace(placeId) {
  try {
    return await deleteDoc(doc(db, 'places', placeId));
  } catch (e) {
    console.error('❌ خطأ في حذف المكان:', e);
    throw e;
  }
}

// ===== المستخدمون =====
export async function addUser(userData) {
  try {
    return await setDoc(doc(db, 'users', userData.uid), {
      ...userData,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error('❌ خطأ في إضافة مستخدم:', e);
    throw e;
  }
}

export async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, 'users', uid));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  } catch (e) {
    console.error('❌ خطأ في جلب المستخدم:', e);
    throw e;
  }
}

export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('❌ خطأ في جلب المستخدمين:', e);
    throw e;
  }
}

export async function deleteUser(uid) {
  try {
    return await deleteDoc(doc(db, 'users', uid));
  } catch (e) {
    console.error('❌ خطأ في حذف المستخدم:', e);
    throw e;
  }
}

// ===== رفع الصور =====
export async function uploadImage(file, path) {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.error('❌ خطأ في رفع الصورة:', e);
    throw e;
  }
}

// ===== طلبات التسجيل =====
export async function addRegistrationRequest(phone, name) {
  try {
    return await addDoc(collection(db, 'registrationRequests'), {
      phone: phone,
      name: name,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error('❌ خطأ في إضافة طلب:', e);
    throw e;
  }
}

export async function getRegistrationRequests() {
  try {
    const q = query(collection(db, 'registrationRequests'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('❌ خطأ في جلب الطلبات:', e);
    throw e;
  }
}

export async function approveRequest(requestId) {
  try {
    return await updateDoc(doc(db, 'registrationRequests', requestId), { status: 'approved' });
  } catch (e) {
    console.error('❌ خطأ في الموافقة:', e);
    throw e;
  }
}
