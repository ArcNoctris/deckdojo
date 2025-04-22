export const MONGODB_CONFIG = {
  uri: process.env.REACT_APP_MONGODB_URI,
  dbName: process.env.REACT_APP_MONGODB_DB_NAME,
  collections: {
    cards: 'cards',
    decks: 'decks',
    users: 'users'
  }
}; 