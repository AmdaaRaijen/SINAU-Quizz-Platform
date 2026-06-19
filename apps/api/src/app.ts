import express from "express";
import { corsMiddleware } from "./config/cors";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { healthRoutes } from "./modules/health/health.routes";
import { questionSetRoutes } from "./modules/question-set/question-set.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { pdfQuizGeneratorRouter } from "./modules/pdf-quiz-generator/pdf-quiz-generator.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/question-sets", questionSetRoutes);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/pdf-quiz", pdfQuizGeneratorRouter);

app.use(errorHandler);

export { app };
