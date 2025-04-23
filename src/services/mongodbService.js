// MongoDB Service - Client-side adapter for MongoDB API
// This service uses real API for cards and deck operations

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

// Deck Operations - Using real MongoDB API
export const createDeck = async (deckData) => {
  try {
    console.log('[mongodbService] Creating deck:', deckData);
    
    if (!deckData || typeof deckData !== 'object') {
      throw new Error('Invalid deck data');
    }
    
    // Format main, extra, and side deck items
    const formatDeckItems = (cards) => {
      return Array.isArray(cards) 
        ? cards.map(card => ({
            card_id: card.id,
            quantity: 1,
            card: card
          }))
        : [];
    };
    
    // Format deck data according to API requirements
    const deckPayload = {
      name: deckData.name || 'New Deck',
      description: deckData.description || '',
      is_public: deckData.visibility === 'public',
      color: deckData.mainColor || '#000000',
      tags: deckData.tags || [],
      format: deckData.format || 'casual',
      user_id: deckData.uid || deckData.user?.uid,
      username: deckData.user?.username || 'Anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_version: 1,
      versions: [
        {
          version_number: 1,
          created_at: new Date().toISOString(),
          name: deckData.name || 'New Deck',
          description: deckData.description || '',
          main_deck: formatDeckItems(deckData.main),
          extra_deck: formatDeckItems(deckData.extra),
          side_deck: formatDeckItems(deckData.side)
        }
      ],
      main_deck: formatDeckItems(deckData.main),
      extra_deck: formatDeckItems(deckData.extra),
      side_deck: formatDeckItems(deckData.side),
      stats: {
        main_count: Array.isArray(deckData.main) ? deckData.main.length : 0,
        extra_count: Array.isArray(deckData.extra) ? deckData.extra.length : 0,
        side_count: Array.isArray(deckData.side) ? deckData.side.length : 0,
        monster_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Monster')).length 
          : 0,
        spell_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Spell')).length 
          : 0,
        trap_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Trap')).length 
          : 0,
        avg_level: Array.isArray(deckData.main) && deckData.main.length > 0
          ? deckData.main.reduce((sum, card) => sum + (card.level || 0), 0) / deckData.main.length
          : 0,
        archetypes: Array.isArray(deckData.main)
          ? [...new Set(deckData.main.map(card => card.archetype).filter(Boolean))]
          : []
      }
    };
    
    console.log('[mongodbService] Prepared deck payload:', deckPayload);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deckPayload)
    });
    
    if (!response.ok) {
      console.error(`[mongodbService] API error: ${response.status} ${response.statusText}`);
      
      // Try to get more error details
      try {
        const errorData = await response.json();
        console.error('[mongodbService] Error details:', errorData);
      } catch (e) {
        console.error('[mongodbService] Could not parse error response');
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`[mongodbService] Deck created with ID: ${result.id || result._id}`);
    return result.id || result._id;
  } catch (error) {
    console.error('[mongodbService] Error creating deck:', error);
    throw error;
  }
};

export const updateDeck = async (deckId, deckData) => {
  try {
    console.log(`[mongodbService] Updating deck ${deckId}:`, deckData);
    
    if (!deckId) {
      console.error('[mongodbService] Invalid deck ID: empty or undefined');
      throw new Error('Invalid deck ID');
    }
    
    // Make sure the deck ID is a string
    const formattedDeckId = String(deckId).trim();
    
    if (!formattedDeckId || formattedDeckId === 'undefined' || formattedDeckId === 'null') {
      console.error(`[mongodbService] Invalid deck ID after formatting: "${formattedDeckId}"`);
      throw new Error('Invalid deck ID format');
    }
    
    console.log(`[mongodbService] Formatted deck ID: ${formattedDeckId}`);
    
    if (!deckData || typeof deckData !== 'object') {
      console.error('[mongodbService] Invalid deck data:', deckData);
      throw new Error('Invalid deck data');
    }
    
    // Get the existing deck first to handle versioning correctly
    const existingDeck = await getDeckById(formattedDeckId);
    if (!existingDeck) {
      console.error(`[mongodbService] Deck with ID ${formattedDeckId} not found`);
      throw new Error(`Deck with ID ${formattedDeckId} not found`);
    }
    
    console.log(`[mongodbService] Found existing deck: ${existingDeck.name}`);
    
    // Format main, extra, and side deck items
    const formatDeckItems = (cards) => {
      return Array.isArray(cards) 
        ? cards.map(card => ({
            card_id: card.id,
            quantity: 1,
            card: card
          }))
        : [];
    };
    
    // Get the current version number
    const currentVersion = (existingDeck.current_version || 0) + 1;
    
    // Prepare the update payload
    const updatePayload = {
      name: deckData.name || existingDeck.name,
      description: deckData.description || existingDeck.description || '',
      is_public: deckData.visibility === 'public' || existingDeck.is_public || false,
      color: deckData.mainColor || existingDeck.color || '#000000',
      tags: deckData.tags || existingDeck.tags || [],
      format: deckData.format || existingDeck.format || 'casual',
      user_id: deckData.uid || deckData.user?.uid || existingDeck.user_id,
      username: deckData.user?.username || existingDeck.username || 'Anonymous',
      created_at: existingDeck.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_version: currentVersion,
      
      // Add the new version
      versions: [
        ...(Array.isArray(existingDeck.versions) ? existingDeck.versions : []),
        {
          version_number: currentVersion,
          created_at: new Date().toISOString(),
          name: deckData.name || existingDeck.name,
          description: deckData.description || existingDeck.description || '',
          main_deck: formatDeckItems(deckData.main),
          extra_deck: formatDeckItems(deckData.extra),
          side_deck: formatDeckItems(deckData.side)
        }
      ],
      
      // Update the current deck contents
      main_deck: formatDeckItems(deckData.main),
      extra_deck: formatDeckItems(deckData.extra),
      side_deck: formatDeckItems(deckData.side),
      
      // Update stats
      stats: {
        main_count: Array.isArray(deckData.main) ? deckData.main.length : 0,
        extra_count: Array.isArray(deckData.extra) ? deckData.extra.length : 0,
        side_count: Array.isArray(deckData.side) ? deckData.side.length : 0,
        monster_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Monster')).length 
          : 0,
        spell_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Spell')).length 
          : 0,
        trap_count: Array.isArray(deckData.main) 
          ? deckData.main.filter(card => card.type && card.type.includes('Trap')).length 
          : 0,
        avg_level: Array.isArray(deckData.main) && deckData.main.length > 0
          ? deckData.main.reduce((sum, card) => sum + (card.level || 0), 0) / deckData.main.length
          : 0,
        archetypes: Array.isArray(deckData.main)
          ? [...new Set(deckData.main.map(card => card.archetype).filter(Boolean))]
          : []
      }
    };
    
    console.log(`[mongodbService] Making API request to update deck ${formattedDeckId}`);
    console.log('[mongodbService] Update payload:', updatePayload);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/decks/${formattedDeckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!response.ok) {
      console.error(`[mongodbService] API error: ${response.status} ${response.statusText}`);
      
      // Try to get more error details
      try {
        const errorData = await response.json();
        console.error('[mongodbService] Error details:', errorData);
      } catch (e) {
        console.error('[mongodbService] Could not parse error response');
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`[mongodbService] Deck ${formattedDeckId} updated successfully`);
    return result;
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
    
    // Make sure the deck ID is a string
    const formattedDeckId = String(deckId).trim();
    
    if (!formattedDeckId || formattedDeckId === 'undefined' || formattedDeckId === 'null') {
      console.error(`[mongodbService] Invalid deck ID after formatting: "${formattedDeckId}"`);
      return null;
    }
    
    console.log(`[mongodbService] Formatted deck ID: ${formattedDeckId}`);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/decks/${formattedDeckId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[mongodbService] Deck with ID ${formattedDeckId} not found`);
        return null;
      }
      console.error(`[mongodbService] API error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const deckData = await response.json();
    
    if (!deckData) {
      console.error('[mongodbService] API returned empty deck data');
      return null;
    }
    
    console.log(`[mongodbService] Retrieved deck data for ${deckData.name || 'unknown deck'}`);
    
    // Extract cards from the deck items
    const extractCards = (deckItems) => {
      return Array.isArray(deckItems)
        ? deckItems.map(item => {
            // If card data is embedded in the item
            if (item.card) {
              return item.card;
            }
            // If we only have card_id, create minimal card object
            return { id: item.card_id };
          })
        : [];
    };
    
    // Transform the API response to match the expected format for the frontend
    const deck = {
      id: deckData.id || deckData._id,
      name: deckData.name,
      description: deckData.description || '',
      visibility: deckData.is_public ? 'public' : 'private',
      mainColor: deckData.color || '#000000',
      tags: deckData.tags || [],
      uid: deckData.user_id,
      username: deckData.username,
      // Extract cards from the deck structures
      main: extractCards(deckData.main_deck),
      extra: extractCards(deckData.extra_deck),
      side: extractCards(deckData.side_deck),
      current_version: deckData.current_version,
      versions: deckData.versions || [],
      createdAt: deckData.created_at,
      updatedAt: deckData.updated_at,
      // Include stats for additional info
      stats: deckData.stats || {
        main_count: 0,
        extra_count: 0,
        side_count: 0
      }
    };
    
    console.log(`[mongodbService] Deck ${formattedDeckId} retrieved successfully`);
    return deck;
  } catch (error) {
    console.error('[mongodbService] Error getting deck by ID:', error);
    throw error;
  }
};

export const getUserDecks = async (userId, page = 1, pageSize = 20, includePrivate = true) => {
  try {
    console.log(`[mongodbService] Getting decks for user: ${userId} (page ${page}, size ${pageSize}, includePrivate: ${includePrivate})`);
    
    if (!userId) {
      console.error('[mongodbService] Invalid user ID: empty or undefined');
      return [];
    }
    
    // Build the URL with pagination and privacy parameters
    const url = `${API_BASE_URL}/decks/user/${userId}?page=${page}&page_size=${pageSize}&include_private=${includePrivate}`;
    console.log(`[mongodbService] Fetching decks with URL: ${url}`);
    
    // Make the API request with explicit headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`[mongodbService] API error: ${response.status} ${response.statusText}`);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.error('[mongodbService] Error response:', errorText);
      } catch (e) {
        console.error('[mongodbService] Could not read error response');
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('[mongodbService] Raw API response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[mongodbService] Error parsing JSON response:', e);
      return [];
    }
    
    console.log('[mongodbService] Parsed API response:', data);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('[mongodbService] No decks found for user');
      return [];
    }
    
    // Extract cards from the deck items
    const extractCards = (deckItems) => {
      return Array.isArray(deckItems)
        ? deckItems.map(item => {
            // If card data is embedded in the item
            if (item.card) {
              return item.card;
            }
            // If we only have card_id, create minimal card object
            return { id: item.card_id };
          })
        : [];
    };
    
    // Check if we have a different response structure
    let decksArray = data;
    
    // Handle potential wrapped response structure
    if (!Array.isArray(data) && data.items && Array.isArray(data.items)) {
      decksArray = data.items;
      console.log('[mongodbService] Found items array in response, using it');
    } else if (!Array.isArray(data) && data.decks && Array.isArray(data.decks)) {
      decksArray = data.decks;
      console.log('[mongodbService] Found decks array in response, using it');
    } else if (!Array.isArray(data)) {
      console.error('[mongodbService] Unexpected response format, expected array or object with items/decks array:', data);
      return [];
    }
    
    console.log(`[mongodbService] Processing ${decksArray.length} decks`);
    
    // Transform each deck to match the expected format
    const decks = decksArray.map(deckData => {
      console.log('[mongodbService] Processing deck:', deckData.name || 'Unnamed deck');
      
      return {
        id: deckData.id || deckData._id,
        name: deckData.name,
        description: deckData.description || '',
        visibility: deckData.is_public ? 'public' : 'private',
        mainColor: deckData.color || '#000000',
        tags: deckData.tags || [],
        uid: deckData.user_id,
        username: deckData.username,
        // Extract cards from the deck structures
        main: extractCards(deckData.main_deck),
        extra: extractCards(deckData.extra_deck),
        side: extractCards(deckData.side_deck),
        current_version: deckData.current_version,
        versions: deckData.versions || [],
        createdAt: deckData.created_at,
        updatedAt: deckData.updated_at,
        // Include stats for additional info
        stats: deckData.stats || {
          main_count: 0,
          extra_count: 0,
          side_count: 0
        }
      };
    });
    
    console.log(`[mongodbService] Retrieved ${decks.length} decks for user ${userId}`);
    return decks;
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
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    console.log(`[mongodbService] Deck ${deckId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error('[mongodbService] Error deleting deck:', error);
    throw error;
  }
}; 