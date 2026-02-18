import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
const CHARACTER_NAMES = ["waldo", "odlaw", "wizard"];
const CHARACTER_LOCATIONS = {
    waldo: { x: 1585, y: 622 },
    odlaw: { x: 273, y: 585 },
    wizard: { x: 695, y: 584 },
};
const TARGET_BOX_SIZE = { width: 60, height: 60 };
const GAME_TOKEN_SUBJECT = "waldo-game-session";
const GAME_TOKEN_TTL = "20m";
function isCharacterName(value) {
    return typeof value === "string" && CHARACTER_NAMES.includes(value);
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return secret;
}
function signGameSession(payload) {
    return jwt.sign({
        sub: GAME_TOKEN_SUBJECT,
        startedAtMs: payload.startedAtMs,
        found: payload.found,
    }, getJwtSecret(), { expiresIn: GAME_TOKEN_TTL });
}
function verifyGameSessionToken(token) {
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
    if (!Array.isArray(decoded.found) || !decoded.found.every((name) => isCharacterName(name))) {
        throw new Error("Invalid found-characters payload.");
    }
    return {
        ...decoded,
        sub: GAME_TOKEN_SUBJECT,
        startedAtMs: decoded.startedAtMs,
        found: decoded.found,
    };
}
function helloWorld(req, res) {
    res.json({ hello: "world" });
}
function gameStart(req, res) {
    try {
        const sessionToken = signGameSession({ startedAtMs: Date.now(), found: [] });
        res.json({
            sessionToken,
            characterNames: CHARACTER_NAMES,
            targetBoxSize: TARGET_BOX_SIZE,
        });
    }
    catch (error) {
        console.error("[gameStart]", error);
        res.status(500).json({ error: "Failed to start game." });
    }
}
function gameGuess(req, res) {
    try {
        const { sessionToken, characterName, x, y } = req.body;
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
            res.status(409).json({ error: "Character already found.", found: session.found });
            return;
        }
        const actual = CHARACTER_LOCATIONS[characterName];
        const minX = x - TARGET_BOX_SIZE.width * (1 / 2);
        const maxX = x + TARGET_BOX_SIZE.width * (1 / 2);
        const minY = y - TARGET_BOX_SIZE.height * (1 / 2);
        const maxY = y + TARGET_BOX_SIZE.height * (1 / 2);
        const isCorrect = actual.x >= minX &&
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
    }
    catch (error) {
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
async function gameEnd(req, res) {
    try {
        const { sessionToken, playerName } = req.body;
        const session = verifyGameSessionToken(sessionToken);
        if (session.found.length !== CHARACTER_NAMES.length) {
            res.status(400).json({ error: "Game is not complete yet." });
            return;
        }
        if (typeof playerName !== "string") {
            res.status(400).json({ error: "Player name is required." });
            return;
        }
        const trimmedName = playerName.trim();
        if (trimmedName.length < 1 || trimmedName.length > 24) {
            res.status(400).json({ error: "Player name must be between 1 and 24 characters." });
            return;
        }
        const elapsedMs = Date.now() - session.startedAtMs;
        if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
            res.status(400).json({ error: "Invalid elapsed time." });
            return;
        }
        const score = await prisma.score.create({
            data: {
                playerName: trimmedName,
                elapsedMs,
            },
            select: {
                id: true,
                playerName: true,
                elapsedMs: true,
                createdAt: true,
            },
        });
        res.status(201).json({ score });
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "Session expired. Start a new game." });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid session token." });
            return;
        }
        console.error("[gameEnd]", error);
        res.status(500).json({ error: "Failed to submit score." });
    }
}
export { helloWorld, gameStart, gameGuess, gameEnd };
//# sourceMappingURL=indexController.js.map