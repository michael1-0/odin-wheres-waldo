import { Router } from "express";
import type { Router as RouterType } from "express";

import { getScores } from "../controllers/scoreController.ts";

const scoreRouter: RouterType = Router();

scoreRouter.get("/", getScores);

export default scoreRouter;
