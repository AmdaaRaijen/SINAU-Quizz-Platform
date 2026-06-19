"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quizStorage as localQuizStorage } from "@/lib/storage/quiz-storage";
import { apiQuizStorage } from "@/lib/storage/api-quiz-adapter";
import { useQuizSession } from "@/features/quiz-runner/hooks/useQuizSession";
import { ProgressBar } from "@/features/quiz-runner/components/ProgressBar";
import { QuestionCard } from "@/features/quiz-runner/components/QuestionCard";
import type { QuestionSet } from "@quiz-platform/shared-types";

export default function QuizRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const source = searchParams.get("source");
  const storage = source === "api" ? apiQuizStorage : localQuizStorage;

  const [quiz, setQuiz] = useState<QuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.get(id).then((data) => {
      if (!data) {
        router.replace("/import");
        return;
      }
      setQuiz(data);
      setIsLoading(false);
    });
  }, [id, router, storage]);

  const session = useQuizSession(quiz || { title: "", questions: [] });

  useEffect(() => {
    if (session.isFinished) {
      // Save answers to local storage so result page can read it
      localStorage.setItem(`answers:${id}`, JSON.stringify(session.answers));
      const sourceQuery = source ? `?source=${source}` : "";
      router.push(`/quiz/${id}/result${sourceQuery}`);
    }
  }, [session.isFinished, id, router, session.answers, source]);

  if (isLoading || !quiz) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Prevent accessing if empty
  if (!session.currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">{quiz.title}</h2>
        <ProgressBar
          current={session.currentIndex + 1}
          total={session.totalQuestions}
        />
      </div>

      <QuestionCard
        question={session.currentQuestion}
        answerRecord={session.currentAnswer}
        onSelectOption={session.submitAnswer}
        onNext={session.nextQuestion}
        isLastQuestion={session.currentIndex === session.totalQuestions - 1}
      />
    </div>
  );
}
