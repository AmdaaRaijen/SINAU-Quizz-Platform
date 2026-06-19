import type { Request, Response } from "express";
import { PdfQuizGeneratorService } from "./pdf-quiz-generator.service";

const service = new PdfQuizGeneratorService();

export class PdfQuizGeneratorController {
  static async generate(req: Request, res: Response) {
    try {
      const file = req.file;
      const user = (req as any).user;

      if (!file) {
        return res.status(400).json({ error: "File PDF tidak ditemukan" });
      }

      if (!user) {
        return res.status(401).json({ error: "Harap login terlebih dahulu" });
      }

      const result = await service.generateFromPdf(file.buffer, file.originalname, user.id);
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Generate error:", error);
      res.status(422).json({ error: error.message || "PDF_EXTRACTION_FAILED" });
    }
  }
}
