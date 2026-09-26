import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    updateDoc, 
    deleteDoc, 
    setDoc,
    query, 
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

// ✅ إعداد Firebase — نفس بياناتك الأصلية
const firebaseConfig = {
    apiKey: "AIzaSyAppr7PHEnnsTYjL3LB0kkMQTnc4qgNR_4",
    authDomain: "ali-alaowishi.firebaseapp.com",
    projectId: "ali-alaowishi",
    storageBucket: "ali-alaowishi.firebasestorage.app",
    messagingSenderId: "536583940962",
    appId: "1:536583940962:web:7a5b8c9d0e1f2a3b4c5d6e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_EMAIL = "alihossin28@gmail.com";
const ADMIN_PASSWORD = "admin123";

// ==========================================
// المصادقة
// ==========================================
export function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

export function isAdmin() {
    const user = getCurrentUser();
    return user?.isAdmin === true;
}

export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (email === ADMIN_EMAIL) {
            const adminData = {
                uid: user.uid,
                email: user.email,
                name: 'المشرف',
                isAdmin: true
            };
            localStorage.setItem('currentUser', JSON.stringify(adminData));
            return { success: true, user: adminData };
        }
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = { uid: user.uid, ...userDoc.data(), isAdmin: false };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        return { success: false, message: 'بيانات غير صحيحة' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function loginAsAdmin(password) {
    if (password === 'admin123') {
        const adminData = {
            uid: 'admin',
            email: ADMIN_EMAIL,
            name: 'المشرف',
            isAdmin: true
        };
        localStorage.setItem('currentUser', JSON.stringify(adminData));
        return { success: true, user: adminData };
    }
    return { success: false, message: 'كلمة المرور غير صحيحة' };
}

export async function loginWithPhone(phone) {
    try {
        const q = query(collection(db, 'users'), where('phone', '==', phone), where('approved', '==', true));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, message: 'رقم الجوال غير مسجل أو بانتظار الموافقة' };
        }
        
        const userData = { uid: snapshot.docs[0].id, ...snapshot.docs[0].data(), isAdmin: false };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function requestRegistration(phone, name) {
    try {
        const q = query(collection(db, 'users'), where('phone', '==', phone));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return { success: false, message: 'هذا الرقم مسجل مسبقاً' };
        }
        
        await addDoc(collection(db, 'users'), {
            phone,
            name,
            approved: false,
            createdAt: new Date().toISOString()
        });
        return { success: true, message: 'تم إرسال الطلب بانتظار موافقة المشرف ✅' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getAllUsers() {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function approveUser(userId) {
    try {
        await updateDoc(doc(db, 'users', userId), { approved: true });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function deleteUser(userId) {
    try {
        await deleteDoc(doc(db, 'users', userId));
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export function logout() {
    localStorage.removeItem('currentUser');
    signOut(auth);
}

// ==========================================
// ✅ دوال الأماكن والمدن — الأساسية
// ==========================================
export async function getAllPlaces() {
    try {
        const q = query(collection(db, 'places'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ خطأ في جلب الأماكن:', error);
        return [];
    }
}

export async function getPlaces() {
    return getAllPlaces();
}

export async function getCities() {
    try {
        const places = await getAllPlaces();
        const cityNames = [...new Set(places.map(p => p.city).filter(c => c))];
        return cityNames.map(name => ({ name }));
    } catch (error) {
        console.error('❌ خطأ في جلب المدن:', error);
        return [];
    }
}

export async function addPlace(placeData) {
    try {
        const user = getCurrentUser();
        const data = {
            ...placeData,
            createdBy: user?.uid || 'unknown',
            createdByName: user?.name || 'مستخدم',
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'places'), data);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ خطأ في إضافة مكان:', error);
        return { success: false, message: error.message };
    }
}

export async function updatePlace(id, data) {
    try {
        await updateDoc(doc(db, 'places', id), data);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function deletePlace(id) {
    try {
        await deleteDoc(doc(db, 'places', id));
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function uploadImage(file) {
    try {
        const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { success: true, url };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
