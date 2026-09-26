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
  getAllUsers, getUserByPhone, addUser, approveUser, deleteUserByAdmin,
  getSettings, saveSettings
} from './db.js';

// بيانات المشرف
const ADMIN_EMAIL = "Alihossin28@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_PHONE = "0500509134";

// حالة المستخدم الحالي
let currentUser = null;

// ===== تسجيل الدخول =====
export async function loginWithPhone(phone) {
  try {
    const user = await getUserByPhone(phone);
    if (!user) {
      return { success: false, message: 'رقم الجوال غير مسجل' };
    }
    if (!user.approved) {
      return { success: false, message: 'بانتظار موافقة المشرف' };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
    return { success: true, user };
  } catch (error) {
    return { success: false, message: 'خطأ في تسجيل الدخول' };
  }
}

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

export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const isAdmin = email === ADMIN_EMAIL;
    const userData = {
      uid: userCredential.user.uid,
      email: email,
      isAdmin: isAdmin
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    currentUser = userData;
    return { success: true };
  } catch (error) {
    return { success: false, message: 'البريد أو كلمة المرور غير صحيحة' };
  }
}

// ===== تسجيل الخروج =====
export function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  return signOut(auth);
}

// ===== التحقق من الحالة =====
export function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem('currentUser');
    if (stored) currentUser = JSON.parse(stored);
  }
  return currentUser;
}

export function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && (user.isAdmin || user.email === ADMIN_EMAIL || user.phone === ADMIN_PHONE);
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
  getAllUsers, addUserByAdmin, deleteUserByAdmin,
  getSettings, saveSettings
};

async function addUserByAdmin(phone, name) {
  try {
    const existing = await getUserByPhone(phone);
    if (existing) return { success: false, message: 'المستخدم موجود مسبقاً' };
    
    const { setDoc } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");
    await setDoc(doc(db, 'users', phone), {
      phone: phone,
      name: name,
      approved: true,
      createdAt: new Date()
    });
    return { success: true, message: '✅ تم إضافة المستخدم' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'خطأ في الإضافة' };
  }
}
