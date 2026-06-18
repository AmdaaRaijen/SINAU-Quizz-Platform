import { questionSetSchema } from "@quiz-platform/shared-types";
import { AppError } from "../../middlewares/error-handler.middleware";
import { formatQuestionSetError } from "@quiz-platform/shared-types";

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
