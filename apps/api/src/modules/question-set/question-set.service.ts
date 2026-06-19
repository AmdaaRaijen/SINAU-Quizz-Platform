import { questionSetSchema } from "@quiz-platform/shared-types";
import { AppError } from "../../middlewares/error-handler.middleware";
import { formatQuestionSetError } from "@quiz-platform/shared-types";
import { prisma } from "../../db/prisma-client";

export const validateQuestionSet = (data: unknown) => {
  const result = questionSetSchema.safeParse(data);
  
  if (!result.success) {
    const errors = formatQuestionSetError(result.error);
    throw new AppError(422, "VALIDATION_ERROR", "Validation failed", errors);
  }

  return {
    valid: true,
    data: {
      title: result.data.title,
      questionCount: result.data.questions.length
    }
  };
};

export const getQuestionSetById = async (id: string) => {
  const questionSet = await prisma.questionSet.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: true }
      }
    }
  });

  if (!questionSet) {
    throw new AppError(404, "NOT_FOUND", "Question set not found");
  }

  return {
    id: questionSet.id,
    title: questionSet.title,
    description: questionSet.description || undefined,
    questions: questionSet.questions.map((q: any) => {
      const correctOpt = q.options.find((o: any) => o.id === q.correctOptionId);
      return {
        id: q.id,
        question: q.text,
        options: q.options.reduce((acc: Record<string, string>, opt: any) => {
          acc[opt.optionKey] = opt.text;
          return acc;
        }, {} as Record<string, string>),
        correctAnswer: correctOpt?.optionKey || "a",
        explanation: q.explanation || undefined
      };
    })
  };
};
