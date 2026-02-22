import { Router } from "express";
import { getScores } from "../controllers/scoreController.js";
const scoreRouter = Router();
scoreRouter.get("/", getScores);
export default scoreRouter;
//# sourceMappingURL=scoreRouter.js.map