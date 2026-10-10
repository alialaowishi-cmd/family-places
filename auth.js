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
  onCities, onPlaces,
  addPurchase, getPurchases, getPurchaseById, updatePurchase, deletePurchase
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

// إعدادات Cloudinary (السحابة الخارجية لرفع الصور)
const CLOUDINARY_CLOUD = 'bitpubcu';
const CLOUDINARY_PRESET = 'family_places';

// ضغط الصورة تلقائياً قبل الرفع (تسريع كبير وتوفير المساحة)
function compressImage(file, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) { resolve(file); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width, height = img.height;
        if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
          resolve(compressed);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// رفع إلى Cloudinary (بدون أي مفاتيح سرية — إعداد مفتوح Unsigned)
async function cloudinaryUpload(file, folder) {
  file = await compressImage(file, 1280, 0.8);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  if (folder) fd.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: fd
  });
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data.error && data.error.message ? data.error.message : 'فشل رفع الصورة إلى Cloudinary');
  }
  return { url: data.secure_url };
}

export async function uploadImage(file) {
  try {
    return await cloudinaryUpload(file, 'places');
  } catch (error) {
    console.error('❌ خطأ رفع الصورة:', error);
    throw error;
  }
}

export async function uploadAvatar(file, phone) {
  try {
    return await cloudinaryUpload(file, 'avatars');
  } catch (error) {
    console.error('❌ خطأ رفع الصورة الشخصية:', error);
    throw error;
  }
}


// رفع ملف الفاتورة (PDF أو صورة) إلى Cloudinary
export async function uploadInvoiceFile(file) {
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    fd.append('folder', 'invoices');
    const endpoint = (file.type === 'application/pdf') ? 'raw' : 'image';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${endpoint}/upload`, {
      method: 'POST', body: fd
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error && data.error.message ? data.error.message : 'فشل رفع الفاتورة');
    return { url: data.secure_url };
  } catch (error) {
    console.error('❌ خطأ رفع الفاتورة:', error);
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
  onCities, onPlaces,
  addPurchase, getPurchases, getPurchaseById, updatePurchase, deletePurchase
};
