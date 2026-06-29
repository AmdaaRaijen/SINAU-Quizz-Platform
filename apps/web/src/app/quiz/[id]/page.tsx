"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quizStorage as localQuizStorage } from "@/lib/storage/quiz-storage";
import { apiQuizStorage } from "@/lib/storage/api-quiz-adapter";
import { useQuizSession, clearSession } from "@/features/quiz-runner/hooks/useQuizSession";
import { ProgressBar } from "@/features/quiz-runner/components/ProgressBar";
import { QuestionCard } from "@/features/quiz-runner/components/QuestionCard";
import { QuestionNavigator } from "@/features/quiz-runner/components/QuestionNavigator";
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

  const session = useQuizSession(quiz || { title: "", questions: [] }, id);

  useEffect(() => {
    if (session.isFinished) {
      // Save final answers so result page can read them, then clear session
      localStorage.setItem(`answers:${id}`, JSON.stringify(session.answers));
      clearSession(id);
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

  if (!session.currentQuestion) return null;

  const questionIds = quiz.questions.map((q) => q.id!);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">{quiz.title}</h2>
        <ProgressBar
          answered={session.answers.length}
          total={session.totalQuestions}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
        {/* Main question area — full width on mobile */}
        <div className="w-full md:flex-1 md:min-w-0">
          <QuestionCard
            question={session.currentQuestion}
            answerRecord={session.currentAnswer}
            onSelectOption={session.submitAnswer}
            onNext={session.nextQuestion}
            isLastQuestion={session.currentIndex === session.totalQuestions - 1}
          />
        </div>

        {/* Navigator panel — desktop sidebar only, mobile handled inside component */}
        <div className="hidden md:block w-56 flex-shrink-0 sticky top-6">
          <QuestionNavigator
            total={session.totalQuestions}
            currentIndex={session.currentIndex}
            answers={session.answers}
            questionIds={questionIds}
            onNavigate={session.goToQuestion}
          />
        </div>
      </div>

      {/* Mobile navigator (floating button + bottom sheet) */}
      <div className="md:hidden">
        <QuestionNavigator
          total={session.totalQuestions}
          currentIndex={session.currentIndex}
          answers={session.answers}
          questionIds={questionIds}
          onNavigate={session.goToQuestion}
        />
      </div>
    </div>
  );
}
