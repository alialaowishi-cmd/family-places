// ==========================================
// دوال التعامل مع قاعدة البيانات — مُصحح كاملاً
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
    return await addDoc(collection(db, 'cities'), {
      ...cityData,
      createdAt: serverTimestamp()
    });
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
    if (cityName) {
      q = query(placesRef, where('city', '==', cityName));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ خطأ في جلب الأماكن:', error);
    return [];
  }
}

export async function addPlace(placeData) {
  try {
    return await addDoc(collection(db, 'places'), {
      ...placeData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ خطأ في إضافة مكان:', error);
    throw error;
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

// ===== المستخدمين — تم إعادة كتابتها بالكامل =====
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

// ✅ تم إصلاح هذه الدالة — كانت سبب الخطأ "خطأ في الإضافة"
export async function addUserByAdmin(phone, name) {
  try {
    const normalizedPhone = phone.trim();
    const existing = await getUserByPhone(normalizedPhone);
    if (existing) {
      return { success: false, message: 'المستخدم موجود مسبقاً' };
    }
    
    // استخدام addDoc بدلاً من setDoc لضمان عملها بشكل صحيح
    await addDoc(collection(db, 'users'), {
      phone: normalizedPhone,
      name: name.trim(),
      approved: true,
      createdAt: new Date()
    });
    console.log('✅ تم إضافة المستخدم بنجاح');
    return { success: true, message: '✅ تم إضافة المستخدم بنجاح' };
  } catch (error) {
    console.error('❌ تفاصيل الخطأ:', error);
    return { success: false, message: 'خطأ: ' + error.message };
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
