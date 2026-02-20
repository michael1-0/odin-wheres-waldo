import { Router } from "express";
import type { Router as RouterType } from "express";

import {
  gameEnd,
  gameGuess,
  gameStart,
  helloWorld,
} from "../controllers/indexController.ts";

import scoreRouter from "./scoreRouter.ts";

const indexRouter: RouterType = Router();

indexRouter.use("/scores", scoreRouter);

indexRouter.get("/", helloWorld);
indexRouter.get("/game-start", gameStart);
indexRouter.post("/game-guess", gameGuess);
indexRouter.post("/game-end", gameEnd);

export default indexRouter;
