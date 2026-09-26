// ==========================================
// إدارة تسجيل الدخول والمستخدمين — نسخة موسّعة (مع الإشعارات)
// ==========================================
import { auth, db, storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import {
  getCities, addCity, deleteCityDoc,
  getPlaces, getPlaceById, getPlacesByUser, addPlace, updatePlace, deletePlace,
  getAllUsers, getUserByPhone, getUserByEmail, addUserByAdmin, updateUserByPhone, deleteUserByAdmin,
  getSettings, saveSettings,
  addNotification, onNotifications,
  getUserPrefs, setUserPrefs, markNotificationRead,
  onCities, onPlaces
} from './db.js';

const ADMIN_PHONE = "0500509134";
const ADMIN_PASSWORD = "admin123";
const ADMIN_EMAIL = "Alihossin28@gmail.com";

let currentUser = null;

export async function loginWithPhone(phone) {
  try {
    const normalizedPhone = phone.trim();
    const user = await getUserByPhone(normalizedPhone);
    if (!user) {
      return { success: false, message: 'رقم الجوال غير مسجل لدى المشرف. اطلب من المشرف إضافة رقمك أولاً.' };
    }
    if (!user.approved) {
      return { success: false, message: 'بانتظار موافقة المشرف' };
    }
    const safeUser = sanitizeUser(user);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    currentUser = safeUser;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error('❌ خطأ تسجيل الدخول:', error);
    return { success: false, message: 'خطأ في تسجيل الدخول: ' + error.message };
  }
}

export async function loginWithEmail(email) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'البريد الإلكتروني غير مسجل لدى المشرف.' };
    }
    if (!user.approved) {
      return { success: false, message: 'بانتظار موافقة المشرف' };
    }
    const safeUser = sanitizeUser(user);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    currentUser = safeUser;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error('❌ خطأ تسجيل الدخول بالبريد:', error);
    return { success: false, message: 'خطأ في تسجيل الدخول: ' + error.message };
  }
}

function sanitizeUser(user) {
  const safe = { ...user };
  if (safe.createdAt && typeof safe.createdAt.toDate === 'function') {
    safe.createdAt = safe.createdAt.toDate().toISOString();
  } else if (safe.createdAt && safe.createdAt.seconds !== undefined) {
    safe.createdAt = new Date(safe.createdAt.seconds * 1000).toISOString();
  }
  return safe;
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

export async function uploadAvatar(file, phone) {
  try {
    const fileName = `avatars/${phone}_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error) {
    console.error('❌ خطأ رفع الصورة الشخصية:', error);
    throw error;
  }
}

export {
  getCities, addCity, deleteCityDoc,
  getPlaces, getPlaceById, getPlacesByUser, addPlace, updatePlace, deletePlace,
  getAllUsers, getUserByPhone, getUserByEmail, addUserByAdmin, updateUserByPhone, deleteUserByAdmin,
  getSettings, saveSettings,
  addNotification, onNotifications,
  getUserPrefs, setUserPrefs, markNotificationRead,
  onCities, onPlaces
};
