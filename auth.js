import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// المشرف
const ADMIN_EMAIL = 'Alihossin28@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// الحالة الحالية
let currentUser = null;

// مراقبة حالة المصادقة
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      currentUser = { uid: user.uid, ...userDoc.data() };
    } else {
      currentUser = { uid: user.uid, email: user.email, phone: user.phoneNumber };
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } else {
    currentUser = null;
    localStorage.removeItem('currentUser');
  }
});

// تسجيل الدخول بالإيميل
export async function loginWithEmail(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
    let userData = { uid: userCred.user.uid, email: email };
    if (userDoc.exists()) {
      userData = { ...userData, ...userDoc.data() };
    }
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// تسجيل الدخول برقم الجوال (مبسط للاستخدام)
export async function loginWithPhone(phone) {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, error: 'رقم الجوال غير مسجل أو غير معتمد' };
    }
    const userDoc = snapshot.docs[0];
    const userData = { uid: userDoc.id, ...userDoc.data() };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// دخول المشرف
export async function loginAsAdmin(password) {
  if (password === 'admin123') {
    const adminData = {
      uid: 'admin',
      email: ADMIN_EMAIL,
      name: 'المشرف',
      phone: '0500509134',
      isAdmin: true
    };
    localStorage.setItem('currentUser', JSON.stringify(adminData));
    return { success: true, user: adminData };
  }
  return { success: false, error: 'كلمة المرور غير صحيحة' };
}

// التحقق من المستخدم الحالي
export function getCurrentUser() {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
}

// تسجيل الخروج
export async function logout() {
  await signOut(auth);
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// حماية الصفحات
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  return user;
}

export function requireAdmin() {
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    alert('غير مصرح لك بالدخول هنا');
    window.location.href = 'home.html';
    return false;
  }
  return user;
}
