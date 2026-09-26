// ==========================================
// دواعد التعامل مع قاعدة البيانات
// ==========================================
import { db } from './firebase-config.js';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// ===== المدن =====
export async function getCities() {
  try {
    const snapshot = await getDocs(collection(db, 'cities'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('خطأ في جلب المدن:', error);
    return [];
  }
}

export async function addCity(cityData) {
  try {
    return await addDoc(collection(db, 'cities'), {
      ...cityData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('خطأ في إضافة مدينة:', error);
    throw error;
  }
}

export async function deleteCityDoc(cityId) {
  try {
    await deleteDoc(doc(db, 'cities', cityId));
    return { success: true };
  } catch (error) {
    console.error('خطأ في حذف المدينة:', error);
    return { success: false, error };
  }
}

// ===== الأماكن =====
export async function getPlaces(cityName = null) {
  try {
    const placesRef = collection(db, 'places');
    let q = placesRef;
    if (cityName) {
      q = query(placesRef, where('city', '==', cityName));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('خطأ في جلب الأماكن:', error);
    return [];
  }
}

export async function getPlaceById(placeId) {
  try {
    const docSnap = await getDoc(doc(db, 'places', placeId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب المكان:', error);
    return null;
  }
}

export async function addPlace(placeData) {
  try {
    return await addDoc(collection(db, 'places'), {
      ...placeData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('خطأ في إضافة مكان:', error);
    throw error;
  }
}

export async function updatePlace(placeId, updateData) {
  try {
    await updateDoc(doc(db, 'places', placeId), updateData);
    return { success: true };
  } catch (error) {
    console.error('خطأ في تحديث المكان:', error);
    return { success: false, error };
  }
}

export async function deletePlace(placeId) {
  try {
    await deleteDoc(doc(db, 'places', placeId));
    return { success: true };
  } catch (error) {
    console.error('خطأ في حذف المكان:', error);
    return { success: false, error };
  }
}

// ===== المستخدمين =====
export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return [];
  }
}

export async function getUserByPhone(phone) {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب المستخدم:', error);
    return null;
  }
}

export async function addUser(userData) {
  try {
    const existing = await getUserByPhone(userData.phone);
    if (existing) return { success: false, message: 'المستخدم مسجل مسبقاً' };
    
    await addDoc(collection(db, 'users'), {
      ...userData,
      approved: false,
      createdAt: serverTimestamp()
    });
    return { success: true, message: 'تم إرسال الطلب للموافقة' };
  } catch (error) {
    console.error('خطأ في إضافة مستخدم:', error);
    return { success: false, message: 'خطأ في التسجيل' };
  }
}

export async function approveUser(userId) {
  try {
    await updateDoc(doc(db, 'users', userId), { approved: true });
    return { success: true };
  } catch (error) {
    console.error('خطأ في الموافقة:', error);
    return { success: false, error };
  }
}

export async function deleteUserByAdmin(phone) {
  try {
    const user = await getUserByPhone(phone);
    if (!user) return { success: false, message: 'المستخدم غير موجود' };
    await deleteDoc(doc(db, 'users', user.id));
    return { success: true, message: 'تم حذف المستخدم' };
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    return { success: false, message: 'خطأ في الحذف' };
  }
}

// ===== الإعدادات =====
export async function getSettings() {
  try {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {
      siteTitle: 'كشتات عائلة حسين العويشي',
      bannerText: 'اكتشفوا أماكننا المفضلة'
    };
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error);
    return {
      siteTitle: 'كشتات عائلة حسين العويشي',
      bannerText: 'اكتشفوا أماكننا المفضلة'
    };
  }
}

export async function saveSettings(settingsData) {
  try {
    await setDoc(doc(db, 'settings', 'site'), settingsData);
    return { success: true };
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    return { success: false, error };
  }
}
