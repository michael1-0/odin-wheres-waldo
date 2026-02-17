import { Router } from "express";
import type { Router as RouterType } from "express";

import { helloWorld } from "../controllers/indexController.ts";

const indexRouter: RouterType = Router();

indexRouter.get("/", helloWorld);

export default indexRouter;
