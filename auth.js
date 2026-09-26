import { auth } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// تسجيل الدخول بالبريد وكلمة المرور
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("خطأ تسجيل الدخول:", error);
    return { success: false, error: error.message };
  }
}

// تسجيل الخروج
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("خطأ تسجيل الخروج:", error);
    return { success: false, error: error.message };
  }
}

// مراقبة حالة المصادقة
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
