import express from "express";
import type { Express } from "express";
import cors from "cors";

import indexRouter from "./routes/indexRouter.ts";

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use(indexRouter);

export default app;
