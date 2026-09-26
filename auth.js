// ==========================================
// إدارة تسجيل الدخول — مُصحح
// ==========================================
import { auth, db, storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { 
  getCities, addCity, deleteCityDoc,
  getPlaces, addPlace, deletePlace,
  getAllUsers, getUserByPhone, addUserByAdmin, deleteUserByAdmin
} from './db.js';

const ADMIN_PHONE = "0500509134";
const ADMIN_PASSWORD = "admin123";
const ADMIN_EMAIL = "Alihossin28@gmail.com";

let currentUser = null;

// ===== تسجيل الدخول برقم الجوال — مُحسن =====
export async function loginWithPhone(phone) {
  try {
    const normalizedPhone = phone.trim();
    console.log('🔍 جاري البحث عن رقم:', normalizedPhone);
    
    const user = await getUserByPhone(normalizedPhone);
    console.log('📤 نتيجة البحث:', user);
    
    if (!user) {
      return { success: false, message: 'رقم الجوال غير مسجل لدى المشرف. اطلب من المشرف إضافة رقمك أولاً.' };
    }
    if (!user.approved) {
      return { success: false, message: 'بانتظار موافقة المشرف' };
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    return { success: true, user };
  } catch (error) {
    console.error('❌ خطأ تسجيل الدخول:', error);
    return { success: false, message: 'خطأ في تسجيل الدخول: ' + error.message };
  }
}

export async function loginAsAdmin(password) {
  if (password === ADMIN_PASSWORD) {
    const adminUser = {
      phone: ADMIN_PHONE,
      name: 'المشرف',
      email: ADMIN_EMAIL,
      isAdmin: true
    };
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    currentUser = adminUser;
    return { success: true };
  }
  return { success: false, message: 'كلمة المرور غير صحيحة' };
}

export function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
}

export function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch { currentUser = null; }
    }
  }
  return currentUser;
}

export function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

export function isAdmin() {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isAdmin === true || user.phone === ADMIN_PHONE;
}

export async function uploadImage(file) {
  try {
    const fileName = `images/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error) {
    console.error('❌ خطأ رفع الصورة:', error);
    throw error;
  }
}

export {
  getCities, addCity, deleteCityDoc,
  getPlaces, addPlace, deletePlace,
  getAllUsers, addUserByAdmin, deleteUserByAdmin
};
