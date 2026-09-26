import { db } from './firebase-config.js';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export async function getCities() {
  try { const s = await getDocs(collection(db, "cities")); return s.docs.map(d => ({id:d.id, ...d.data()})); }
  catch(e) { console.error(e); return []; }
}

export async function addCity(data) {
  try { const r = await addDoc(collection(db, "cities"), {...data, createdAt: serverTimestamp()}); return {success:true, id:r.id}; }
  catch(e) { console.error(e); return {success:false}; }
}

export async function getPlaces(city=null) {
  try { const qry = city ? query(collection(db,"places"), where("city","==",city), orderBy("createdAt","desc")) : query(collection(db,"places"), orderBy("createdAt","desc")); const s = await getDocs(qry); return s.docs.map(d => ({id:d.id, ...d.data()})); }
  catch(e) { console.error(e); return []; }
}

export async function addPlace(data) {
  try { const r = await addDoc(collection(db, "places"), {...data, createdAt: serverTimestamp()}); return {success:true, id:r.id}; }
  catch(e) { console.error(e); return {success:false}; }
}

export async function getPlaceById(id) {
  try { const d = await getDoc(doc(db,"places",id)); return d.exists() ? {id:d.id, ...d.data()} : null; }
  catch(e) { console.error(e); return null; }
}

export async function updatePlace(id, data) {
  try { await updateDoc(doc(db,"places",id), data); return {success:true}; }
  catch(e) { console.error(e); return {success:false}; }
}

export async function deletePlace(id) {
  try { await deleteDoc(doc(db,"places",id)); return {success:true}; }
  catch(e) { console.error(e); return {success:false}; }
}

export async function getUserByPhone(phone) {
  try { const s = await getDocs(query(collection(db,"users"), where("phone","==",phone))); return s.empty ? null : {id:s.docs[0].id, ...s.docs[0].data()}; }
  catch(e) { console.error(e); return null; }
}

export async function addUser(data) {
  try { const r = await addDoc(collection(db, "users"), data); return {success:true, id:r.id}; }
  catch(e) { console.error(e); return {success:false}; }
}

export async function getAllUsers() {
  try { const s = await getDocs(collection(db, "users")); return s.docs.map(d => ({id:d.id, ...d.data()})); }
  catch(e) { console.error(e); return []; }
}
