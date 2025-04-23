// This file now re-exports deck functions from the MongoDB service
import { 
  getUserDecks as getMongoUserDecks, 
  getDeckById as getMongoDeckById, 
  createDeck as createMongoDeck,
  updateDeck as updateMongoDeck,
  deleteDeck as deleteMongoDeck
} from './mongodbService';

// Re-export functions from MongoDB service
export const getUserDecks = getMongoUserDecks;
export const getDeckById = getMongoDeckById;
export const createDeck = createMongoDeck;
export const updateDeck = updateMongoDeck;
export const deleteDeck = deleteMongoDeck; 