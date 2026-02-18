import { Router } from "express";
import type { Router as RouterType } from "express";

import {
  gameGuess,
  gameStart,
  helloWorld,
} from "../controllers/indexController.ts";

const indexRouter: RouterType = Router();

indexRouter.get("/", helloWorld);
indexRouter.get("/game-start", gameStart);
indexRouter.post("/game-guess", gameGuess);

export default indexRouter;
