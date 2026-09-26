import { db } from './firebase-config.js';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// === دوال المدن ===
export async function getCities() {
  try {
    const snapshot = await getDocs(collection(db, "cities"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب المدن:", error);
    return [];
  }
}

export async function addCity(cityData) {
  try {
    const docRef = await addDoc(collection(db, "cities"), {
      ...cityData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("خطأ في إضافة مدينة:", error);
    return { success: false, error: error.message };
  }
}

// === دوال الأماكن ===
export async function getPlaces(cityName = null) {
  try {
    let q;
    if (cityName) {
      q = query(
        collection(db, "places"), 
        where("city", "==", cityName),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "places"), orderBy("createdAt", "desc"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب الأماكن:", error);
    return [];
  }
}

export async function getPlaceById(placeId) {
  try {
    const docSnap = await getDoc(doc(db, "places", placeId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("خطأ في جلب المكان:", error);
    return null;
  }
}

export async function addPlace(placeData) {
  try {
    const docRef = await addDoc(collection(db, "places"), {
      ...placeData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("خطأ في إضافة مكان:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePlace(placeId, placeData) {
  try {
    await updateDoc(doc(db, "places", placeId), placeData);
    return { success: true };
  } catch (error) {
    console.error("خطأ في تحديث المكان:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePlace(placeId) {
  try {
    await deleteDoc(doc(db, "places", placeId));
    return { success: true };
  } catch (error) {
    console.error("خطأ في حذف المكان:", error);
    return { success: false, error: error.message };
  }
}

// === دوال المستخدمين ===
export async function getUserByPhone(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("خطأ في جلب المستخدم:", error);
    return null;
  }
}

export async function addUser(userData) {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("خطأ في إضافة مستخدم:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب المستخدمين:", error);
    return [];
  }
}
