// ==========================================
// دوال التعامل مع قاعدة البيانات — بدون أي localStorage للبيانات المشتركة
// ==========================================
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// ===== المدن =====
export async function getCities() {
  try {
    const snapshot = await getDocs(collection(db, 'cities'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ خطأ في جلب المدن:', error);
    return [];
  }
}

export async function addCity(cityData) {
  try {
    return await addDoc(collection(db, 'cities'), { ...cityData, createdAt: serverTimestamp() });
  } catch (error) {
    console.error('❌ خطأ في إضافة مدينة:', error);
    throw error;
  }
}

export async function deleteCityDoc(cityId) {
  try {
    await deleteDoc(doc(db, 'cities', cityId));
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في حذف المدينة:', error);
    return { success: false, error };
  }
}

// ===== الأماكن =====
export async function getPlaces(cityName = null) {
  try {
    const placesRef = collection(db, 'places');
    let q = placesRef;
    if (cityName) q = query(placesRef, where('city', '==', cityName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ خطأ في جلب الأماكن:', error);
    return [];
  }
}

export async function getPlaceById(placeId) {
  try {
    const snap = await getDoc(doc(db, 'places', placeId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب المكان:', error);
    return null;
  }
}

export async function getPlacesByUser(phone) {
  try {
    const q = query(collection(db, 'places'), where('createdBy', '==', phone));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ خطأ في جلب أماكن المستخدم:', error);
    return [];
  }
}

export async function addPlace(placeData) {
  try {
    return await addDoc(collection(db, 'places'), { ...placeData, createdAt: serverTimestamp() });
  } catch (error) {
    console.error('❌ خطأ في إضافة مكان:', error);
    throw error;
  }
}

export async function updatePlace(placeId, data) {
  try {
    await updateDoc(doc(db, 'places', placeId), data);
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تحديث المكان:', error);
    return { success: false, error };
  }
}

export async function deletePlace(placeId) {
  try {
    await deleteDoc(doc(db, 'places', placeId));
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في حذف المكان:', error);
    return { success: false, error };
  }
}

// ===== المستخدمون =====
export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    return [];
  }
}

export async function getUserByPhone(phone) {
  try {
    const normalizedPhone = phone.trim();
    const q = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدم:', error);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدم بالبريد:', error);
    return null;
  }
}

export async function addUserByAdmin(phone, name, email = '') {
  try {
    const normalizedPhone = phone.trim();
    const existing = await getUserByPhone(normalizedPhone);
    if (existing) return { success: false, message: 'المستخدم موجود مسبقاً' };
    const data = { phone: normalizedPhone, name: name.trim(), approved: true, createdAt: serverTimestamp() };
    if (email && email.trim()) data.email = email.trim().toLowerCase();
    await addDoc(collection(db, 'users'), data);
    return { success: true, message: '✅ تم إضافة المستخدم بنجاح' };
  } catch (error) {
    console.error('❌ تفاصيل الخطأ:', error);
    return { success: false, message: 'خطأ: ' + error.message };
  }
}

export async function updateUserByPhone(phone, data) {
  try {
    const user = await getUserByPhone(phone);
    if (!user) return { success: false, message: 'المستخدم غير موجود' };
    await updateDoc(doc(db, 'users', user.id), data);
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تحديث المستخدم:', error);
    return { success: false, error };
  }
}

export async function deleteUserByAdmin(phone) {
  try {
    const user = await getUserByPhone(phone);
    if (!user) return { success: false, message: 'المستخدم غير موجود' };
    await deleteDoc(doc(db, 'users', user.id));
    return { success: true, message: '✅ تم حذف المستخدم' };
  } catch (error) {
    console.error('❌ خطأ في حذف المستخدم:', error);
    return { success: false, message: 'خطأ في الحذف' };
  }
}

// ===== إعدادات الموقع =====
export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    if (snap.exists()) return snap.data();
    return {};
  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    return {};
  }
}

export async function saveSettings(data) {
  try {
    await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في حفظ الإعدادات:', error);
    return { success: false, error };
  }
}

// ===== الإشعارات العامة =====
export async function addNotification(data) {
  try {
    return await addDoc(collection(db, 'notifications'), {
      title: data.title || 'إشعار جديد',
      message: data.message || '',
      placeId: data.placeId || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
    throw error;
  }
}

export function onNotifications(callback) {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => {
        const data = d.data();
        let time = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          time = data.createdAt.toDate().toISOString();
        }
        return { id: d.id, title: data.title, message: data.message, placeId: data.placeId || null, time };
      });
      callback(list);
    }, (err) => console.error('❌ خطأ في استماع الإشعارات:', err));
  } catch (error) {
    console.error('❌ خطأ في تشغيل استماع الإشعارات:', error);
    return () => {};
  }
}

// ===== تفضيلات كل مستخدم (تُحفظ في Firestore وتتزامن بين أجهزته) =====
export async function getUserPrefs(phone) {
  try {
    const snap = await getDoc(doc(db, 'userPrefs', phone));
    if (snap.exists()) return snap.data();
    return {};
  } catch (error) {
    console.error('❌ خطأ في جلب تفضيلات المستخدم:', error);
    return {};
  }
}

export async function setUserPrefs(phone, data) {
  try {
    await setDoc(doc(db, 'userPrefs', phone), data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في حفظ تفضيلات المستخدم:', error);
    return { success: false, error };
  }
}

export async function markNotificationRead(phone, notifId) {
  try {
    await setDoc(doc(db, 'userPrefs', phone), { readNotifications: arrayUnion(notifId) }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تعليم الإشعار كمقروء:', error);
    return { success: false, error };
  }
}


// ===== استماع لحظي (تحديث مباشر دون تحديث الصفحة) =====
export function onCities(callback) {
  try {
    return onSnapshot(collection(db, 'cities'), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('❌ خطأ في استماع المدن:', err));
  } catch (error) {
    console.error('❌ خطأ في تشغيل استماع المدن:', error);
    return () => {};
  }
}

export function onPlaces(cityName, callback) {
  try {
    let q = collection(db, 'places');
    if (cityName) q = query(collection(db, 'places'), where('city', '==', cityName));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('❌ خطأ في استماع الأماكن:', err));
  } catch (error) {
    console.error('❌ خطأ في تشغيل استماع الأماكن:', error);
    return () => {};
  }
}
