import { useEffect, useState } from "react";

export interface ActiveSession {
  id: string;
  title: string;
  answeredCount: number;
  totalQuestions: number;
}

/**
 * Scans localStorage for quiz entries that still have an in-progress session
 * (i.e. quiz-session:<id> exists alongside quiz:<id>).
 */
export function useActiveQuizSessions(): {
  sessions: ActiveSession[];
  isLoading: boolean;
} {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const found: ActiveSession[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("quiz:")) continue;

      const id = key.replace("quiz:", "");
      const sessionRaw = localStorage.getItem(`quiz-session:${id}`);
      if (!sessionRaw) continue;

      try {
        const quizRaw = localStorage.getItem(key);
        if (!quizRaw) continue;

        const quiz = JSON.parse(quizRaw);
        const session = JSON.parse(sessionRaw);

        // Skip sessions that are already finished
        if (session.isFinished) continue;

        found.push({
          id,
          title: quiz.title ?? "Quiz tanpa judul",
          answeredCount: Array.isArray(session.answers) ? session.answers.length : 0,
          totalQuestions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
        });
      } catch {
        // ignore malformed entries
      }
    }

    setSessions(found);
    setIsLoading(false);
  }, []);

  return { sessions, isLoading };
}
