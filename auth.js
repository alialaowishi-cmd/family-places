import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

export async function signIn(email, password) {
  try { const u = await signInWithEmailAndPassword(auth, email, password); return {success:true, user:u.user}; }
  catch(e) { return {success:false, error:e.message}; }
}

export async function signOutUser() {
  try { await signOut(auth); return {success:true}; }
  catch(e) { return {success:false}; }
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}
