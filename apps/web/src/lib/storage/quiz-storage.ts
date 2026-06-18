import { type QuestionSet } from "@quiz-platform/shared-types";

export interface QuizStorageAdapter {
  save(id: string, data: QuestionSet): Promise<void>;
  get(id: string): Promise<QuestionSet | null>;
  list(): Promise<{ id: string; title: string }[]>;
  remove(id: string): Promise<void>;
}

export class LocalStorageQuizAdapter implements QuizStorageAdapter {
  private getPrefix() {
    return "quiz:";
  }

  async save(id: string, data: QuestionSet): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${this.getPrefix()}${id}`, JSON.stringify(data));
  }

  async get(id: string): Promise<QuestionSet | null> {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(`${this.getPrefix()}${id}`);
    if (!item) return null;
    try {
      return JSON.parse(item) as QuestionSet;
    } catch (e) {
      console.error("Failed to parse quiz from local storage", e);
      return null;
    }
  }

  async list(): Promise<{ id: string; title: string }[]> {
    if (typeof window === "undefined") return [];
    const list: { id: string; title: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.getPrefix())) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item) as QuestionSet;
            list.push({
              id: key.replace(this.getPrefix(), ""),
              title: data.title
            });
          }
        } catch (e) {
          // Ignore invalid items
        }
      }
    }
    return list;
  }

  async remove(id: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${this.getPrefix()}${id}`);
  }
}

// Instantiate default adapter for phase 1
export const quizStorage: QuizStorageAdapter = new LocalStorageQuizAdapter();
