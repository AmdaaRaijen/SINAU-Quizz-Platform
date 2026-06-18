import express from "express";
import { corsMiddleware } from "./config/cors";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { healthRoutes } from "./modules/health/health.routes";
import { questionSetRoutes } from "./modules/question-set/question-set.routes";

const app = express();

app.use(express.json());
app.use(corsMiddleware);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/question-sets", questionSetRoutes);

app.use(errorHandler);

export { app };
