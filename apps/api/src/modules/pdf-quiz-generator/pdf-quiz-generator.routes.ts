import { Router } from "express";
import { PdfQuizGeneratorController } from "./pdf-quiz-generator.controller";
import { requireAuth } from "../../middlewares/require-auth.middleware";
import { uploadMiddleware } from "../../middlewares/upload.middleware";

export const pdfQuizGeneratorRouter = Router();

pdfQuizGeneratorRouter.post(
  "/generate",
  requireAuth,
  uploadMiddleware.single("file"),
  PdfQuizGeneratorController.generate
);
