"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { quizStorage as localQuizStorage } from "@/lib/storage/quiz-storage";
import { calculateScore } from "@/features/quiz-result/utils/scoreCalculator";
import { ScoreSummary } from "@/features/quiz-result/components/ScoreSummary";
import { ExplanationPanel } from "@/features/quiz-runner/components/ExplanationPanel";
import type { QuestionSet, OptionKey } from "@quiz-platform/shared-types";
import type { AnswerRecord } from "@/features/quiz-runner/hooks/useQuizSession";
import { apiQuizStorage } from "@/lib/storage/api-quiz-adapter";

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();

  const router = useRouter();
  const { id } = use(params);
  const source = searchParams.get("source");

  const storage = source === "api" ? apiQuizStorage : localQuizStorage;

  const [quiz, setQuiz] = useState<QuestionSet | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.get(id).then((data) => {
      if (!data) {
        router.replace("/import");
        return;
      }

      const savedAnswers = localStorage.getItem(`answers:${id}`);
      if (!savedAnswers) {
        // No answers found, redirect back to quiz
        router.replace(`/quiz/${id}?source=${source}`);
        return;
      }

      setQuiz(data);
      setAnswers(JSON.parse(savedAnswers));
      setIsLoading(false);
    });
  }, [id, router]);

  if (isLoading || !quiz || !answers) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const { correctCount, percentage } = calculateScore(
    answers,
    quiz.questions.length,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{quiz.title}</h2>
        <Link
          href="/import"
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          Import Quiz Baru
        </Link>
      </div>

      <ScoreSummary
        correctCount={correctCount}
        totalQuestions={quiz.questions.length}
        percentage={percentage}
      />

      <div className="space-y-6 pt-8">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-4">
          Review Jawaban
        </h3>

        {quiz.questions.map((question, idx) => {
          const answer = answers.find((a) => a.questionId === question.id);
          if (!answer) return null;

          return (
            <div
              key={question.id}
              className="bg-[var(--color-surface)] p-6 rounded-xl border border-slate-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                  {idx + 1}
                </span>
                <p className="font-semibold text-slate-800 pt-1 leading-relaxed">
                  {question.question}
                </p>
              </div>

              <div className="pl-12 space-y-4">
                <div className="grid gap-2">
                  <div className="flex gap-2 items-start text-sm">
                    <span className="font-medium text-slate-500 w-32">
                      Jawaban Anda:
                    </span>
                    <span
                      className={`font-semibold ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}
                    >
                      {answer.selectedKey.toUpperCase()}.{" "}
                      {question.options[answer.selectedKey as OptionKey]}
                    </span>
                  </div>
                  {!answer.isCorrect && (
                    <div className="flex gap-2 items-start text-sm">
                      <span className="font-medium text-slate-500 w-32">
                        Jawaban Benar:
                      </span>
                      <span className="font-semibold text-green-600">
                        {question.correctAnswer.toUpperCase()}.{" "}
                        {question.options[question.correctAnswer as OptionKey]}
                      </span>
                    </div>
                  )}
                </div>

                <ExplanationPanel
                  explanation={question.explanation}
                  isCorrect={answer.isCorrect}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={() => {
            localStorage.removeItem(`answers:${id}`);
            router.push(`/quiz/${id}`);
          }}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Coba Lagi Quiz Ini
        </button>
      </div>
    </div>
  );
}
