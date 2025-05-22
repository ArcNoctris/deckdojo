// Import all background images
import deckdojoBg from './deckdojo-bg.png';

// Duplicate the deckdojo background for other pages
// These will be replaced with actual backgrounds later
const duelBg = deckdojoBg;
const exploreBg = deckdojoBg;
const arsenalBg = deckdojoBg;
const communityBg = deckdojoBg;
const profileBg = deckdojoBg;
const settingsBg = deckdojoBg;

// Export all backgrounds
export const pageBackgrounds = {
  home: deckdojoBg,
  duel: duelBg,
  explore: exploreBg,
  arsenal: arsenalBg,
  community: communityBg,
  profile: profileBg,
  settings: settingsBg,
};

// Export individual backgrounds
export {
  deckdojoBg,
  duelBg,
  exploreBg,
  arsenalBg,
  communityBg,
  profileBg,
  settingsBg,
}; 