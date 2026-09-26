// ==========================================
// إدارة تسجيل الدخول والصلاحيات والملفات
// ==========================================
import { auth, db, storage } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { 
  getCities, addCity, deleteCityDoc,
  getPlaces, addPlace, deletePlace,
  getAllUsers, getUserByPhone, addUser, approveUser, deleteUserByAdmin, addUserByAdmin,
  getSettings, saveSettings
} from './db.js';

// بيانات المشرف
const ADMIN_EMAIL = "Alihossin28@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_PHONE = "0500509134";

// حالة المستخدم الحالي
let currentUser = null;

// ===== تسجيل الدخول برقم الجوال =====
export async function loginWithPhone(phone) {
  try {
    const user = await getUserByPhone(phone);
    if (!user) {
      return { success: false, message: 'رقم الجوال غير مسجل لدى المشرف' };
    }
    if (!user.approved) {
      return { success: false, message: 'بانتظار موافقة المشرف' };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    return { success: true, user };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'خطأ في تسجيل الدخول' };
  }
}

// ===== دخول المشرف بكلمة المرور =====
export async function loginAsAdmin(password) {
  if (password === 'admin123') {
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

// ===== تسجيل الدخول بالبريد =====
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const isAdmin = email === ADMIN_EMAIL;
    const userData = {
      uid: userCredential.user.uid,
      email: email,
      name: 'المشرف',
      isAdmin: isAdmin
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    currentUser = userData;
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'البريد أو كلمة المرور غير صحيحة' };
  }
}

// ===== تسجيل الخروج =====
export function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  return signOut(auth);
}

// ===== الحصول على بيانات المستخدم الحالي =====
export function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch {
        currentUser = null;
      }
    }
  }
  return currentUser;
}

// ===== التحقق من تسجيل الدخول =====
export function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

// ===== التحقق من صلاحيات المشرف =====
export function isAdmin() {
  const user = getCurrentUser();
  if (!user) return false;
  return user.isAdmin === true || 
         user.email === ADMIN_EMAIL || 
         user.phone === ADMIN_PHONE;
}

// ===== رفع الصور =====
export async function uploadImage(file) {
  try {
    const fileName = `images/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    throw error;
  }
}

// تصدير جميع الدوال
export {
  getCities, addCity, deleteCityDoc,
  getPlaces, addPlace, deletePlace,
  getAllUsers, addUser, approveUser, deleteUserByAdmin, addUserByAdmin,
  getSettings, saveSettings
};
