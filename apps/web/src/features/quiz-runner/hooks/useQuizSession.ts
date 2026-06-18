import { useState } from "react";
import type { QuestionSet, OptionKey } from "@quiz-platform/shared-types";

export interface AnswerRecord {
  questionId: string;
  selectedKey: OptionKey;
  isCorrect: boolean;
}

export function useQuizSession(quiz: QuestionSet) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const hasAnsweredCurrent = !!currentAnswer;

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

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: quiz.questions.length,
    answers,
    isFinished,
    hasAnsweredCurrent,
    currentAnswer,
    submitAnswer,
    nextQuestion
  };
}
