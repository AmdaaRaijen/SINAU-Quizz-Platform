import { questionSetSchema, formatQuestionSetError, type QuestionSet } from "@quiz-platform/shared-types";

export type ValidationResult = 
  | { success: true; data: QuestionSet }
  | { success: false; errors: Array<{ path: string; message: string }> };

export function parseAndValidateJson(jsonString: string): ValidationResult {
  try {
    const parsedJson = JSON.parse(jsonString);
    const result = questionSetSchema.safeParse(parsedJson);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        errors: formatQuestionSetError(result.error) 
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ path: "root", message: "Format JSON tidak valid. Pastikan format penulisan JSON sudah benar." }]
    };
  }
}
