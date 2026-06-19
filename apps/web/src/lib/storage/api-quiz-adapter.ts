import { type QuestionSet } from "@quiz-platform/shared-types";
import { type QuizStorageAdapter } from "./quiz-storage";

export class ApiQuizAdapter implements QuizStorageAdapter {
  async save(id: string, data: QuestionSet): Promise<void> {
    throw new Error("ApiQuizAdapter.save is not implemented for client. Generation is done via backend endpoint.");
  }

  async get(id: string): Promise<QuestionSet | null> {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/question-sets/${id}`;
      const res = await fetch(url);
      if (!res.ok) {
        return null;
      }
      return await res.json() as QuestionSet;
    } catch (e) {
      console.error("Failed to fetch quiz from API", e);
      return null;
    }
  }

  async list(): Promise<{ id: string; title: string }[]> {
    return [];
  }

  async remove(id: string): Promise<void> {
    throw new Error("ApiQuizAdapter.remove is not implemented");
  }
}

export const apiQuizStorage: QuizStorageAdapter = new ApiQuizAdapter();
