import type { Request, Response } from "express";
import { prisma } from "../db/prisma.ts";

async function getScores(req: Request, res: Response) {
  try {
    const scores = await prisma.score.findMany({
      orderBy: [{ elapsedMs: "asc" }, { createdAt: "asc" }],
    });

    res.json({ scores });
  } catch (error) {
    console.error("[getScores]", error);
    res.status(500).json({ error: "Failed to fetch scores." });
  }
}

export { getScores };
