import crypto from "crypto";

const SECRET_KEY =
  process.env.LEADERBOARD_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "mic-recruitment-flappy-bird-secret-key-2026";

// Store used session IDs in memory to prevent replay attacks (in-memory nonce store)
const usedSessionIds = new Set<string>();

// Keep memory clean by removing session IDs periodically
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const sessionTimestamps = new Map<string, number>();

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, timestamp] of sessionTimestamps.entries()) {
    if (now - timestamp > SESSION_TTL_MS) {
      usedSessionIds.delete(id);
      sessionTimestamps.delete(id);
    }
  }
}

/**
 * Hashes a player's client-side UUID to hide raw tokens in DB
 */
export function hashPlayerToken(playerToken: string): string {
  if (!playerToken || typeof playerToken !== "string") {
    return "";
  }
  return crypto.createHash("sha256").update(playerToken).digest("hex");
}

export interface GameSessionData {
  sessionId: string;
  playerTokenHash: string;
  startTime: number;
  sessionToken: string;
}

/**
 * Generates an HMAC-signed game session token for an unauthenticated player start
 */
export function createGameSessionToken(playerToken: string): GameSessionData {
  const sessionId = crypto.randomUUID();
  const playerTokenHash = hashPlayerToken(playerToken);
  const startTime = Date.now();

  const payload = `${sessionId}:${playerTokenHash}:${startTime}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  const sessionToken = `${sessionId}.${playerTokenHash}.${startTime}.${signature}`;

  return {
    sessionId,
    playerTokenHash,
    startTime,
    sessionToken,
  };
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  sessionId?: string;
  playerTokenHash?: string;
  startTime?: number;
}

/**
 * Verifies the integrity, signature, time validity, and single-use status of a game session token
 */
export function verifyGameSessionToken(
  sessionToken: string,
  playerToken: string
): VerificationResult {
  if (!sessionToken || typeof sessionToken !== "string") {
    return { valid: false, reason: "Missing or invalid session token format." };
  }

  const parts = sessionToken.split(".");
  if (parts.length !== 4) {
    return { valid: false, reason: "Malformed session token format." };
  }

  const [sessionId, tokenHashInToken, startTimeStr, signature] = parts;
  const startTime = parseInt(startTimeStr, 10);

  if (isNaN(startTime) || startTime <= 0) {
    return { valid: false, reason: "Invalid session timestamp." };
  }

  // 1. Verify player token hash matches
  const expectedPlayerTokenHash = hashPlayerToken(playerToken);
  if (!expectedPlayerTokenHash || expectedPlayerTokenHash !== tokenHashInToken) {
    return { valid: false, reason: "Player identity token mismatch." };
  }

  // 2. Verify HMAC signature
  const payload = `${sessionId}:${tokenHashInToken}:${startTimeStr}`;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    return { valid: false, reason: "Invalid cryptographic session signature." };
  }

  // 3. Check for replay attack (single-use token)
  cleanupExpiredSessions();
  if (usedSessionIds.has(sessionId)) {
    return { valid: false, reason: "Session token has already been submitted." };
  }

  // 4. Session maximum age check (e.g. 2 hours)
  if (Date.now() - startTime > SESSION_TTL_MS) {
    return { valid: false, reason: "Game session expired." };
  }

  return {
    valid: true,
    sessionId,
    playerTokenHash: expectedPlayerTokenHash,
    startTime,
  };
}

/**
 * Marks a game session ID as consumed to prevent token replay attacks
 */
export function consumeGameSessionToken(sessionId: string): void {
  usedSessionIds.add(sessionId);
  sessionTimestamps.set(sessionId, Date.now());
}

/**
 * Physical Flappy Bird physics & speed limit score validation
 */
export function validateGameScore(
  score: number,
  startTime: number
): { valid: boolean; reason?: string } {
  const now = Date.now();
  const elapsedMs = now - startTime;

  // Maximum logical score cap
  if (score > 2000) {
    return { valid: false, reason: "Score exceeds maximum allowed threshold." };
  }

  // Future timestamp prevention
  if (elapsedMs < -5000) {
    return { valid: false, reason: "Invalid game timing clock." };
  }

  // Flappy Bird physical minimum time: 1 pipe takes at least ~800ms
  // Score 21 = 21 * 0.8s = 16.8 seconds
  const minRequiredMs = Math.floor(score * 800);
  if (elapsedMs < minRequiredMs) {
    return {
      valid: false,
      reason: `Unrealistic gameplay duration (${Math.round(
        elapsedMs / 1000
      )}s elapsed for score ${score}).`,
    };
  }

  return { valid: true };
}
