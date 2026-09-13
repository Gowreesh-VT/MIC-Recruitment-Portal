import { dbConnect } from "./mongodb";
import Leaderboard from "../models/Leaderboard";
import { generateRandomAnonymousName } from "./anonymousNames";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Dev", "Diya", "Ishan", "Kavya", "Manav",
  "Neha", "Pranav", "Rohan", "Riya", "Sahil", "Siddharth", "Tanvi", "Utkarsh",
  "Varun", "Yash", "Zoya", "Alex", "Chris", "Jordan", "Morgan", "Taylor", "Sam"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Kumar", "Singh", "Joshi", "Mehta",
  "Nair", "Rao", "Reddy", "Chopra", "Deshmukh", "Iyer", "Kulkarni", "Shah"
];

function getRandomRealName(): string {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

export async function seedLeaderboardEntries(count = 100) {
  await dbConnect();

  console.log(`Seeding ${count} leaderboard entries into MongoDB...`);

  // Clear previous test leaderboard entries if needed, or append
  const sampleEntries = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Generate scores between 21 and 210, with realistic distribution
    const baseScore = Math.floor(21 + Math.pow(Math.random(), 1.8) * 190);
    const anonName = generateRandomAnonymousName();
    const realName = getRandomRealName();

    // Spread timestamps across the last 7 days
    const timeOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    const createdAt = new Date(now - timeOffset);

    sampleEntries.push({
      anonymousName: anonName,
      realName,
      score: baseScore,
      createdAt,
    });
  }

  // Insert documents
  const result = await Leaderboard.insertMany(sampleEntries);
  console.log(`Successfully seeded ${result.length} entries into Leaderboard collection!`);
  return result.length;
}

// Execute directly if run via CLI/tsx
if (require.main === module || process.argv[1]?.endsWith("seedLeaderboard.ts")) {
  seedLeaderboardEntries(100)
    .then((n) => {
      console.log(`Done seeding ${n} leaderboard documents.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Leaderboard seed error:", err);
      process.exit(1);
    });
}
