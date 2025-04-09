import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Auth functions
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Social auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // If user doesn't exist in Firestore, create a new document
    if (!userDoc.exists()) {
      await createDocument('users', {
        username: user.displayName || user.email.split('@')[0],
        email: user.email,
        createdAt: new Date().toISOString(),
        decks: [],
        gameHistory: []
      }, user.uid);
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Placeholder functions for future auth methods
export const signInWithFacebook = async () => {
  try {
    // This is a placeholder for future implementation
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Facebook:", error);
    throw error;
  }
};

export const signInWithTwitter = async () => {
  try {
    // This is a placeholder for future implementation
    const result = await signInWithPopup(auth, twitterProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Twitter:", error);
    throw error;
  }
};

// Firestore functions
export const createDocument = async (collectionName, data, id = null) => {
  try {
    if (id) {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, data);
      return { id, ...data };
    } else {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, data);
      return { id: docRef.id, ...data };
    }
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

export const queryDocuments = async (collectionName, fieldName, operator, value) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(fieldName, operator, value));
    const querySnapshot = await getDocs(q);
    
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error("Error querying documents:", error);
    throw error;
  }
};

export const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error("Error getting all documents:", error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export { auth, db };
