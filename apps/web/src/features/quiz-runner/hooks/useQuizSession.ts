import { useState, useEffect, useCallback } from "react";
import type { QuestionSet, OptionKey } from "@quiz-platform/shared-types";

export interface AnswerRecord {
  questionId: string;
  selectedKey: OptionKey;
  isCorrect: boolean;
}

interface SessionState {
  currentIndex: number;
  answers: AnswerRecord[];
  isFinished: boolean;
}

const SESSION_PREFIX = "quiz-session:";

function loadSession(quizId: string): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${SESSION_PREFIX}${quizId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

function saveSession(quizId: string, state: SessionState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SESSION_PREFIX}${quizId}`, JSON.stringify(state));
}

export function clearSession(quizId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${SESSION_PREFIX}${quizId}`);
}

export function useQuizSession(quiz: QuestionSet, quizId?: string) {
  // Load persisted session on first render
  const saved = quizId ? loadSession(quizId) : null;

  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<AnswerRecord[]>(saved?.answers ?? []);
  const [isFinished, setIsFinished] = useState(saved?.isFinished ?? false);

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const hasAnsweredCurrent = !!currentAnswer;

  // Persist whenever state changes
  useEffect(() => {
    if (!quizId || quiz.questions.length === 0) return;
    saveSession(quizId, { currentIndex, answers, isFinished });
  }, [quizId, currentIndex, answers, isFinished, quiz.questions.length]);

  const submitAnswer = (selectedKey: OptionKey) => {
    if (hasAnsweredCurrent) return;

    const isCorrect = selectedKey === currentQuestion.correctAnswer;
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id!,
        selectedKey,
        isCorrect
      }
    ]);
  };

  const nextQuestion = () => {
    if (!hasAnsweredCurrent) return;
    
    if (isLastQuestion) {
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= quiz.questions.length) return;
    setCurrentIndex(index);
  }, [quiz.questions.length]);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: quiz.questions.length,
    answers,
    isFinished,
    hasAnsweredCurrent,
    currentAnswer,
    submitAnswer,
    nextQuestion,
    goToQuestion
  };
}
