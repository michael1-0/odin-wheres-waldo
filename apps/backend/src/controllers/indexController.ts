import type { Request, Response } from "express";
import { prisma } from "../db/prisma.ts";

async function helloWorld(req: Request, res: Response) {
  const data = await prisma.score.findMany();
  console.log(data);

  res.json({ hello: "world" });
}

export { helloWorld };
