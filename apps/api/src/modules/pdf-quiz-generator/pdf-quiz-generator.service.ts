import { MarkItDownApiExtractor } from "./pdf-extractor/markitdown-api.extractor";
import { DeepSeekProvider } from "./llm/deepseek.provider";
import { questionSetSchema } from "@quiz-platform/shared-types";
import { prisma } from "../../db/prisma-client";

export class PdfQuizGeneratorService {
  private pdfExtractor = new MarkItDownApiExtractor();
  private llmProvider = new DeepSeekProvider();

  async generateFromPdf(fileBuffer: Buffer, fileName: string, userId: string) {
    const { markdown } = await this.pdfExtractor.extract(fileBuffer, fileName);

    const llmOutputString = await this.llmProvider.generateQuestionSet(markdown);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(llmOutputString);
    } catch (e) {
      throw new Error("LLM_OUTPUT_INVALID_JSON");
    }

    const validationResult = questionSetSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      throw new Error("LLM_OUTPUT_SCHEMA_MISMATCH");
    }

    const validatedData = validationResult.data;

    const questionSet = await prisma.questionSet.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        ownerId: userId,
        questions: {
          create: validatedData.questions.map((q, idx) => ({
            orderIndex: idx,
            text: q.question,
            explanation: q.explanation,
            options: {
              create: Object.entries(q.options).map(([key, text]) => ({
                optionKey: key,
                text: text as string
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    for (const q of questionSet.questions) {
      const origQuestion = validatedData.questions[q.orderIndex];
      const correctOpt = q.options.find((o: any) => o.optionKey === origQuestion.correctAnswer);
      if (correctOpt) {
        await prisma.question.update({
          where: { id: q.id },
          data: { correctOptionId: correctOpt.id }
        });
      }
    }

    const finalSet = {
      id: questionSet.id,
      title: questionSet.title,
      description: questionSet.description || undefined,
      questions: questionSet.questions.map((q: any) => {
        const origQuestion = validatedData.questions[q.orderIndex];
        return {
          id: q.id,
          question: q.text,
          options: q.options.reduce((acc: Record<string, string>, opt: any) => {
            acc[opt.optionKey] = opt.text;
            return acc;
          }, {} as Record<string, string>),
          correctAnswer: origQuestion.correctAnswer,
          explanation: q.explanation || undefined
        };
      })
    };

    return finalSet;
  }
}
