import { db } from './firebase/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export const createDuelSession = async (hostId, hostName) => {
  try {
    const sessionRef = doc(collection(db, 'duelSessions'));
    const sessionData = {
      hostId,
      hostName,
      guestId: null,
      guestName: null,
      hostLifePoints: 8000,
      guestLifePoints: 8000,
      status: 'waiting', // waiting, active, finished
      createdAt: new Date(),
      updatedAt: new Date(),
      turnPlayer: 'host',
      turnCount: 0,
      lifePointHistory: []
    };

    await setDoc(sessionRef, sessionData);
    return sessionRef.id;
  } catch (error) {
    console.error('Error creating duel session:', error);
    throw error;
  }
};

export const joinDuelSession = async (sessionId, guestId, guestName) => {
  try {
    const sessionRef = doc(db, 'duelSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error('Duel session not found');
    }

    const sessionData = sessionDoc.data();
    if (sessionData.status !== 'waiting') {
      throw new Error('Duel session is no longer available');
    }

    await updateDoc(sessionRef, {
      guestId,
      guestName,
      status: 'active',
      updatedAt: new Date()
    });

    return sessionData;
  } catch (error) {
    console.error('Error joining duel session:', error);
    throw error;
  }
};

export const updateLifePoints = async (sessionId, playerId, newLifePoints) => {
  try {
    const sessionRef = doc(db, 'duelSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error('Duel session not found');
    }

    const sessionData = sessionDoc.data();
    const isHost = playerId === sessionData.hostId;
    const field = isHost ? 'hostLifePoints' : 'guestLifePoints';
    const history = [...sessionData.lifePointHistory];
    
    history.push({
      playerId,
      oldValue: sessionData[field],
      newValue: newLifePoints,
      timestamp: new Date()
    });

    await updateDoc(sessionRef, {
      [field]: newLifePoints,
      lifePointHistory: history,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating life points:', error);
    throw error;
  }
};

export const endDuelSession = async (sessionId, winnerId) => {
  try {
    const sessionRef = doc(db, 'duelSessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'finished',
      winnerId,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error ending duel session:', error);
    throw error;
  }
};

export const getActiveDuelSessions = async () => {
  try {
    const sessionsRef = collection(db, 'duelSessions');
    const q = query(sessionsRef, where('status', '==', 'waiting'));
    const querySnapshot = await getDocs(q);
    
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error fetching active duel sessions:', error);
    throw error;
  }
};

export const getDuelSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'duelSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    return {
      id: sessionDoc.id,
      ...sessionDoc.data()
    };
  } catch (error) {
    console.error('Error fetching duel session:', error);
    throw error;
  }
}; 