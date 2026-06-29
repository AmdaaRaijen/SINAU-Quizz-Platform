"use client";

import { useState } from "react";
import type { AnswerRecord } from "../hooks/useQuizSession";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answers: AnswerRecord[];
  questionIds: string[];
  onNavigate: (index: number) => void;
}

type QuestionStatus = "active" | "correct" | "wrong" | "unanswered";

function getStatus(
  index: number,
  currentIndex: number,
  answers: AnswerRecord[],
  questionIds: string[]
): QuestionStatus {
  if (index === currentIndex) return "active";
  const answer = answers.find((a) => a.questionId === questionIds[index]);
  if (!answer) return "unanswered";
  return answer.isCorrect ? "correct" : "wrong";
}

const statusStyles: Record<QuestionStatus, string> = {
  active:
    "bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)] ring-offset-1 font-bold",
  correct:
    "bg-green-100 text-green-700 border border-green-300 font-semibold",
  wrong: "bg-red-100 text-red-700 border border-red-300 font-semibold",
  unanswered:
    "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200",
};

/** Shared inner content — used by both desktop panel and mobile bottom sheet */
function NavigatorInner({
  total,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
  onClose,
}: QuestionNavigatorProps & { onClose?: () => void }) {
  const answeredCount = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[var(--color-primary)] flex-shrink-0" />
          <span>Sedang dikerjakan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-300 flex-shrink-0" />
          <span>Benar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-100 border border-red-300 flex-shrink-0" />
          <span>Salah</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 flex-shrink-0" />
          <span>Belum dijawab</span>
        </div>
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const status = getStatus(i, currentIndex, answers, questionIds);
          return (
            <button
              key={i}
              onClick={() => {
                onNavigate(i);
                onClose?.();
              }}
              className={`w-full aspect-square rounded-md text-xs transition-all ${statusStyles[status]}`}
              title={`Soal ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Mini score */}
      {answeredCount > 0 && (
        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span className="text-green-600 font-medium">✓ Benar</span>
            <span className="font-semibold text-green-600">{correctCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500 font-medium">✗ Salah</span>
            <span className="font-semibold text-red-500">
              {answeredCount - correctCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionNavigator(props: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { answers, total } = props;
  const answeredCount = answers.length;

  return (
    <>
      {/* ── Desktop: sticky sidebar ── */}
      <div className="bg-[var(--color-surface)] border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Navigasi Soal</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {answeredCount}/{total} terjawab
          </p>
        </div>
        <NavigatorInner {...props} />
      </div>

      {/* ── Mobile: floating button ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-3 rounded-full shadow-lg font-semibold text-sm"
        aria-label="Buka navigasi soal"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span>
          {answeredCount}/{total}
        </span>
      </button>

      {/* ── Mobile: bottom sheet ── */}
      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80dvh" }}
      >
        {/* Fixed header */}
        <div className="flex-shrink-0 pt-3 pb-2 px-5 border-b border-slate-100">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Navigasi Soal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {answeredCount}/{total} terjawab
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Tutup navigator"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          <NavigatorInner {...props} onClose={() => setIsOpen(false)} />
        </div>
      </div>
    </>
  );
}
