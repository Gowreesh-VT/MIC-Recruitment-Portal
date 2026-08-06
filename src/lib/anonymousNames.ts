// Google Sheets style anonymous identity generator for Flappy Bird Leaderboard
// Generates fun, privacy-preserving names like "Anonymous Snake", "Anonymous Cyber Tiger", "Anonymous Axolotl"

const ANIMALS = [
  "Snake", "Tiger", "Axolotl", "Capybara", "Falcon", "Otter", "Chameleon",
  "Dragon", "Kraken", "Phoenix", "Wolf", "Lynx", "Bear", "Dolphin", "Eagle",
  "Fox", "Gecko", "Hedgehog", "Iguana", "Jaguar", "Koala", "Lemur", "Mammoth",
  "Narwhal", "Owl", "Penguin", "Quokka", "Rabbit", "Shark", "Toucan", "Unicorn",
  "Vulture", "Walrus", "Yak", "Zebra", "Badger", "Cheetah", "Dingo", "Ferret",
  "Giraffe", "Flamingo", "Moose", "Panda", "Raven", "Salamander", "Sloth",
  "Viper", "Wombat", "Bison", "Cougar", "Octopus", "Pelican", "Wolverine",
  "Albatross", "Beaver", "Chinchilla", "Duk", "Hyena", "Ibis", "Kangaroo",
  "Manatee", "Ocelot", "Pangolin", "Racoon", "Seahorse", "Tapir", "Vicuna"
];

const ADJECTIVES = [
  "", "Cyber", "Retro", "Neon", "Shadow", "Golden", "Swift", "Cosmic",
  "Silent", "Radiant", "Arcane", "Hyper", "Turbo", "Mystic", "Echo",
  "Astral", "Stealth", "Thunder", "Vortex", "Blaze", "Frost", "Iron",
  "Alpha", "Nova", "Phantom", "Quantum", "Lunar", "Solar", "Crimson",
  "Emerald", "Sapphire", "Velvet", "Wild", "Spirit", "Titan", "Apex"
];

const STORAGE_KEY = "flappy_bird_anon_name";

/**
 * Generates a random Google Sheets style anonymous moniker.
 * Combines 60+ animals and 30+ adjectives or random number tags.
 */
export function generateRandomAnonymousName(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  
  if (adjective) {
    return `Anonymous ${adjective} ${animal}`;
  }
  
  // If no adjective, append a random 3-digit tag for unique identity scaling
  const tag = Math.floor(100 + Math.random() * 900);
  return `Anonymous ${animal} #${tag}`;
}

/**
 * Retrieves the persisted anonymous moniker from localStorage, or creates & saves a new one.
 */
export function getOrCreateAnonymousName(): string {
  if (typeof window === "undefined") {
    return "Anonymous Bird";
  }

  try {
    let savedName = localStorage.getItem(STORAGE_KEY);
    if (!savedName || !savedName.startsWith("Anonymous ")) {
      savedName = generateRandomAnonymousName();
      localStorage.setItem(STORAGE_KEY, savedName);
    }
    return savedName;
  } catch (e) {
    console.error("Failed to access localStorage for anonymous name:", e);
    return "Anonymous Bird";
  }
}

/**
 * Regenerates and returns a new anonymous identity if the player wants a new persona.
 */
export function regenerateAnonymousName(): string {
  if (typeof window === "undefined") return "Anonymous Bird";
  const newName = generateRandomAnonymousName();
  try {
    localStorage.setItem(STORAGE_KEY, newName);
  } catch (e) {
    console.error("Failed to save new anonymous name:", e);
  }
  return newName;
}
