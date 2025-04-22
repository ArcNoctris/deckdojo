import { db } from './firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';

export const getUserDecks = async (userId) => {
  try {
    const decksRef = collection(db, 'deck');
    const q = query(decksRef, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deckList = [];
    querySnapshot.forEach((doc) => {
      const deckData = doc.data();
      deckList.push({
        id: doc.id,
        ...deckData,
        main: deckData.main || [],
        extra: deckData.extra || [],
        side: deckData.side || []
      });
    });
    
    return deckList;
  } catch (error) {
    console.error('Error fetching decks:', error);
    throw error;
  }
};

export const getDeckById = async (deckId) => {
  try {
    const deckRef = doc(db, 'deck', deckId);
    const deckSnap = await getDoc(deckRef);
    
    if (deckSnap.exists()) {
      const deckData = deckSnap.data();
      return {
        id: deckSnap.id,
        ...deckData,
        main: deckData.main || [],
        extra: deckData.extra || [],
        side: deckData.side || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching deck:', error);
    throw error;
  }
};

export const createDeck = async (deckData) => {
  try {
    const deckRef = await addDoc(collection(db, 'deck'), {
      ...deckData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return deckRef.id;
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
};

export const updateDeck = async (deckId, deckData) => {
  try {
    const deckRef = doc(db, 'deck', deckId);
    await updateDoc(deckRef, {
      ...deckData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
}; 