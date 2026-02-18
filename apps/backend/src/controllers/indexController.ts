import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

function helloWorld(req: Request, res: Response) {
  res.json({ hello: "world" });
}

const CHARACTER_NAMES = ["waldo", "odlaw", "wizard"] as const;
type CharacterName = (typeof CHARACTER_NAMES)[number];

const CHARACTER_LOCATIONS: Record<CharacterName, { x: number; y: number }> = {
  waldo: { x: 1585, y: 622 },
  odlaw: { x: 273, y: 585 },
  wizard: { x: 695, y: 584 },
};

const TARGET_BOX_SIZE = { width: 60, height: 60 } as const;
const GAME_TOKEN_SUBJECT = "waldo-game-session";
const GAME_TOKEN_TTL = "20m";

interface GameSessionPayload extends jwt.JwtPayload {
  sub: typeof GAME_TOKEN_SUBJECT;
  startedAtMs: number;
  found: CharacterName[];
}

function isCharacterName(value: unknown): value is CharacterName {
  return (
    typeof value === "string" &&
    CHARACTER_NAMES.includes(value as CharacterName)
  );
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

function signGameSession(
  payload: Pick<GameSessionPayload, "startedAtMs" | "found">,
): string {
  return jwt.sign(
    {
      sub: GAME_TOKEN_SUBJECT,
      startedAtMs: payload.startedAtMs,
      found: payload.found,
    },
    getJwtSecret(),
    { expiresIn: GAME_TOKEN_TTL },
  );
}

function verifyGameSessionToken(token: unknown): GameSessionPayload {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("Session token is required.");
  }

  const decoded = jwt.verify(token, getJwtSecret());

  if (typeof decoded === "string") {
    throw new Error("Invalid session token payload.");
  }

  if (decoded.sub !== GAME_TOKEN_SUBJECT) {
    throw new Error("Invalid session token subject.");
  }

  if (typeof decoded.startedAtMs !== "number") {
    throw new Error("Invalid session start timestamp.");
  }

  if (
    !Array.isArray(decoded.found) ||
    !decoded.found.every((name) => isCharacterName(name))
  ) {
    throw new Error("Invalid found-characters payload.");
  }

  return {
    ...decoded,
    sub: GAME_TOKEN_SUBJECT,
    startedAtMs: decoded.startedAtMs,
    found: decoded.found,
  };
}

function gameStart(req: Request, res: Response) {
  try {
    const sessionToken = signGameSession({
      startedAtMs: Date.now(),
      found: [],
    });

    res.json({
      sessionToken,
      characterNames: CHARACTER_NAMES,
      targetBoxSize: TARGET_BOX_SIZE,
    });
  } catch (error) {
    console.error("[gameStart]", error);
    res.status(500).json({ error: "Failed to start game." });
  }
}

function gameGuess(req: Request, res: Response) {
  try {
    const { sessionToken, characterName, x, y } = req.body as {
      sessionToken?: unknown;
      characterName?: unknown;
      x?: unknown;
      y?: unknown;
    };

    if (!isCharacterName(characterName)) {
      res.status(400).json({ error: "Invalid character name." });
      return;
    }

    if (typeof x !== "number" || typeof y !== "number") {
      res.status(400).json({ error: "Coordinates must be numbers." });
      return;
    }

    const session = verifyGameSessionToken(sessionToken);

    if (session.found.includes(characterName)) {
      res
        .status(409)
        .json({ error: "Character already found.", found: session.found });
      return;
    }

    const actual = CHARACTER_LOCATIONS[characterName];
    const minX = x - TARGET_BOX_SIZE.width * (1 / 2);
    const maxX = x + TARGET_BOX_SIZE.width * (1 / 2);
    const minY = y - TARGET_BOX_SIZE.height * (1 / 2);
    const maxY = y + TARGET_BOX_SIZE.height * (1 / 2);

    const isCorrect =
      actual.x >= minX &&
      actual.x <= maxX &&
      actual.y >= minY &&
      actual.y <= maxY;

    const updatedFound = isCorrect
      ? [...new Set([...session.found, characterName])]
      : session.found;

    const nextToken = signGameSession({
      startedAtMs: session.startedAtMs,
      found: updatedFound,
    });

    res.json({
      isCorrect,
      found: updatedFound,
      allFound: updatedFound.length === CHARACTER_NAMES.length,
      sessionToken: nextToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Session expired. Start a new game." });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid session token." });
      return;
    }

    console.error("[gameGuess]", error);
    res.status(400).json({ error: "Invalid guess request." });
  }
}

export { helloWorld, gameStart, gameGuess };
