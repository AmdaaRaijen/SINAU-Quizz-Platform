import { describe, it, expect } from "vitest";
import { questionSetSchema, formatQuestionSetError } from "./quiz-question.schema";

describe("questionSetSchema", () => {
  it("should validate a correct question set", () => {
    const validData = {
      title: "Valid Quiz",
      questions: [
        {
          question: "What is 1+1?",
          options: { a: "1", b: "2" },
          correctAnswer: "b"
        }
      ]
    };
    
    const result = questionSetSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject options with missing sequential keys", () => {
    const invalidData = {
      title: "Invalid Quiz",
      questions: [
        {
          question: "What is 1+1?",
          options: { a: "1", c: "3" }, // missing b
          correctAnswer: "a"
        }
      ]
    };
    
    const result = questionSetSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatQuestionSetError(result.error);
      expect(formatted[0].message).toContain("berurutan dari 'a'");
    }
  });

  it("should reject correctAnswer that is not in options", () => {
    const invalidData = {
      title: "Invalid Quiz",
      questions: [
        {
          question: "What is 1+1?",
          options: { a: "1", b: "2" },
          correctAnswer: "c"
        }
      ]
    };
    
    const result = questionSetSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatQuestionSetError(result.error);
      expect(formatted[0].message).toContain("salah satu key yang ada di options");
      expect(formatted[0].path).toBe("questions.0.correctAnswer");
    }
  });
});
