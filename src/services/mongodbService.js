// MongoDB Service - Client-side adapter for MongoDB API
// This service uses real API for cards and mock data for decks until deck endpoints are ready

// API base URL for the real MongoDB API
const API_BASE_URL = 'https://web-production-d4ebf.up.railway.app';

// Sample card data for development
const MOCK_CARDS = [
  {
    id: "1",
    name: "Dark Magician",
    type: "Normal Monster",
    frameType: "normal",
    desc: "The ultimate wizard in terms of attack and defense.",
    atk: 2500,
    def: 2100,
    level: 7,
    race: "Spellcaster",
    attribute: "DARK",
    image_url: "https://images.ygoprodeck.com/images/cards/46986414.jpg"
  },
  {
    id: "2",
    name: "Blue-Eyes White Dragon",
    type: "Normal Monster",
    frameType: "normal",
    desc: "This legendary dragon is a powerful engine of destruction.",
    atk: 3000,
    def: 2500,
    level: 8,
    race: "Dragon",
    attribute: "LIGHT",
    image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg"
  },
  {
    id: "3",
    name: "Monster Reborn",
    type: "Spell Card",
    frameType: "spell",
    desc: "Target 1 monster in either GY; Special Summon it.",
    race: "Normal",
    image_url: "https://images.ygoprodeck.com/images/cards/83764719.jpg"
  },
  {
    id: "4",
    name: "Mirror Force",
    type: "Trap Card",
    frameType: "trap",
    desc: "When an opponent's monster declares an attack: Destroy all your opponent's Attack Position monsters.",
    race: "Normal",
    image_url: "https://images.ygoprodeck.com/images/cards/44095762.jpg"
  },
  {
    id: "5",
    name: "Pot of Greed",
    type: "Spell Card",
    frameType: "spell",
    desc: "Draw 2 cards.",
    race: "Normal",
    image_url: "https://images.ygoprodeck.com/images/cards/55144522.jpg"
  }
];

// Sample deck data for development (keeping deck operations as mock for now)
const MOCK_DECKS = {
  "user123": [
    {
      id: "deck1",
      name: "Blue-Eyes Deck",
      main: [],
      extra: [],
      side: [],
      mainColor: "#1a237e",
      uid: "user123",
      createdAt: new Date(2023, 0, 15).toISOString(),
      updatedAt: new Date(2023, 2, 20).toISOString()
    },
    {
      id: "deck2",
      name: "Dark Magician Deck",
      main: [],
      extra: [],
      side: [],
      mainColor: "#4a148c",
      uid: "user123",
      createdAt: new Date(2023, 1, 5).toISOString(),
      updatedAt: new Date(2023, 1, 10).toISOString()
    }
  ]
};

// Helper to validate and sanitize card objects
const validateCard = (card, source = 'unknown') => {
  if (!card) {
    console.error(`[mongodbService] Invalid card (${source}): null or undefined`);
    return false;
  }
  
  if (typeof card !== 'object') {
    console.error(`[mongodbService] Invalid card (${source}): not an object`, card);
    return false;
  }
  
  if (Object.keys(card).length === 0) {
    console.error(`[mongodbService] Invalid card (${source}): empty object`, card);
    return false;
  }
  
  return true;
};

// Card Operations - Now using real API
export const searchCards = async (searchTerm, filters = {}) => {
  try {
    console.log("[mongodbService] Searching cards with term:", searchTerm, "and filters:", filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('fname', searchTerm); // Using fname for card name search

    // Map frontend filters to API parameters
    if (filters.type) params.append('type', filters.type);
    if (filters.attribute) params.append('attribute', filters.attribute);
    if (filters.minLevel) params.append('level', filters.minLevel); // API doesn't support range, using min for now
    if (filters.minATK) params.append('atk', filters.minATK); // API doesn't support range, using min for now
    if (filters.minDEF) params.append('def', filters.minDEF); // API doesn't support range, using min for now
    console.log('params');
    console.log(`${API_BASE_URL}/cards?${params.toString()}`);

    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/cards?${params.toString()}`);
    console.log(response);
    //response.json().then(data => console.log(data));
    
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[mongodbService] Search returned ${data.cards.length} cards`);
    
    // Transform data if needed to match expected format and validate
    const validCards = Array.isArray(data.cards) 
      ? data.cards.filter(card => validateCard(card, 'searchCards'))
      : [];
    
    return validCards;
  } catch (error) {
    console.error('[mongodbService] Error searching cards:', error);
    return [];
  }
};

export const getCardById = async (cardId) => {
  try {
    console.log(`[mongodbService] Getting card by ID: ${cardId}`);
    
    if (!cardId) {
      console.error('[mongodbService] Invalid card ID: empty or undefined');
      return null;
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[mongodbService] Card with ID ${cardId} not found`);
        return null;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const card = await response.json();
    
    if (validateCard(card, 'getCardById')) {
      console.log(`[mongodbService] Found card: ${card.name}`);
      return card;
    }
    
    return null;
  } catch (error) {
    console.error('[mongodbService] Error getting card by ID:', error);
    return null;
  }
};

export const getCardsByArchetype = async (archetype) => {
  try {
    console.log(`[mongodbService] Getting cards by archetype: ${archetype}`);
    
    if (!archetype) {
      console.error('[mongodbService] Invalid archetype: empty or undefined');
      return [];
    }
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/cards?archetype=${encodeURIComponent(archetype)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate and process cards
    const cards = Array.isArray(data) 
      ? data.filter(card => validateCard(card, 'getCardsByArchetype'))
      : [];
    
    console.log(`[mongodbService] Found ${cards.length} cards for archetype ${archetype}`);
    return cards;
  } catch (error) {
    console.error('[mongodbService] Error getting cards by archetype:', error);
    return [];
  }
};

export const getRandomCards = async (count = 10) => {
  try {
    console.log(`[mongodbService] Getting ${count} random cards`);
    
    // Make the API request - since there's no specific random endpoint,
    // we'll just fetch some cards and then randomize on the client
    const response = await fetch(`${API_BASE_URL}/cards?num=${count}&offset=0`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate and process cards
    let cards = Array.isArray(data) 
      ? data.filter(card => validateCard(card, 'getRandomCards'))
      : [];
    
    // If we need randomization, shuffle the array
    if (cards.length > count) {
      cards = cards.sort(() => 0.5 - Math.random()).slice(0, count);
    }
    
    console.log(`[mongodbService] Retrieved ${cards.length} random cards`);
    return cards;
  } catch (error) {
    console.error('[mongodbService] Error getting random cards:', error);
    return [];
  }
};

// Helper function to find decks for a user (mock implementation)
const getDecksForUser = (userId) => {
  return MOCK_DECKS[userId] || [];
};

// Helper function to find a deck by ID (mock implementation)
const findDeckById = (deckId) => {
  for (const userId in MOCK_DECKS) {
    const deck = MOCK_DECKS[userId].find(d => d.id === deckId);
    if (deck) return deck;
  }
  return null;
};

// Deck Operations - Still using mock implementation for now
export const createDeck = async (deckData) => {
  try {
    console.log('[mongodbService] Creating deck:', deckData);
    
    if (!deckData || typeof deckData !== 'object') {
      throw new Error('Invalid deck data');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate a unique ID
    const newId = `deck${Date.now()}`;
    
    // Create the deck in our mock data
    const newDeck = {
      id: newId,
      ...deckData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock decks
    const userId = deckData.uid;
    if (!MOCK_DECKS[userId]) {
      MOCK_DECKS[userId] = [];
    }
    MOCK_DECKS[userId].push(newDeck);
    
    console.log(`[mongodbService] Deck created with ID: ${newId}`);
    return newId;
  } catch (error) {
    console.error('[mongodbService] Error creating deck:', error);
    throw error;
  }
};

export const updateDeck = async (deckId, deckData) => {
  try {
    console.log(`[mongodbService] Updating deck ${deckId}:`, deckData);
    
    if (!deckId) {
      throw new Error('Invalid deck ID');
    }
    
    if (!deckData || typeof deckData !== 'object') {
      throw new Error('Invalid deck data');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the deck
    const deck = findDeckById(deckId);
    if (!deck) {
      throw new Error(`Deck with ID ${deckId} not found`);
    }
    
    // Update deck
    Object.assign(deck, deckData, { updatedAt: new Date().toISOString() });
    
    console.log(`[mongodbService] Deck ${deckId} updated successfully`);
    return { ...deck };
  } catch (error) {
    console.error('[mongodbService] Error updating deck:', error);
    throw error;
  }
};

export const getDeckById = async (deckId) => {
  try {
    console.log(`[mongodbService] Getting deck by ID: ${deckId}`);
    
    if (!deckId) {
      console.error('[mongodbService] Invalid deck ID: empty or undefined');
      return null;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the deck
    const deck = findDeckById(deckId);
    
    if (deck) {
      console.log(`[mongodbService] Deck ${deckId} retrieved successfully`);
      return { ...deck };
    }
    
    console.warn(`[mongodbService] Deck with ID ${deckId} not found`);
    return null;
  } catch (error) {
    console.error('[mongodbService] Error getting deck by ID:', error);
    throw error;
  }
};

export const getUserDecks = async (userId) => {
  try {
    console.log(`[mongodbService] Getting decks for user: ${userId}`);
    
    if (!userId) {
      console.error('[mongodbService] Invalid user ID: empty or undefined');
      return [];
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get decks for the user
    const decks = getDecksForUser(userId);
    
    console.log(`[mongodbService] Retrieved ${decks.length} decks for user ${userId}`);
    return [...decks];
  } catch (error) {
    console.error('[mongodbService] Error getting user decks:', error);
    throw error;
  }
};

export const deleteDeck = async (deckId) => {
  try {
    console.log(`[mongodbService] Deleting deck: ${deckId}`);
    
    if (!deckId) {
      throw new Error('Invalid deck ID');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Find the deck and remove it
    for (const userId in MOCK_DECKS) {
      const deckIndex = MOCK_DECKS[userId].findIndex(d => d.id === deckId);
      if (deckIndex !== -1) {
        MOCK_DECKS[userId].splice(deckIndex, 1);
        console.log(`[mongodbService] Deck ${deckId} deleted successfully`);
        return { success: true };
      }
    }
    
    throw new Error(`Deck with ID ${deckId} not found`);
  } catch (error) {
    console.error('[mongodbService] Error deleting deck:', error);
    throw error;
  }
}; 