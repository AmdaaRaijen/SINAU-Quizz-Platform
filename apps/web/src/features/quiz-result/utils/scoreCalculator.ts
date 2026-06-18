import type { AnswerRecord } from "../../quiz-runner/hooks/useQuizSession";

export function calculateScore(answers: AnswerRecord[], totalQuestions: number) {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  return {
    correctCount,
    percentage
  };
}
