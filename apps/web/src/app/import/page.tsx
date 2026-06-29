"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JsonPasteInput } from "@/features/quiz-import/components/JsonPasteInput";
import { PdfUploadInput } from "@/features/quiz-import/components/PdfUploadInput";
import { useActiveQuizSessions } from "@/features/quiz-import/hooks/useActiveQuizSessions";
import { quizStorage } from "@/lib/storage/quiz-storage";
import { clearSession } from "@/features/quiz-runner/hooks/useQuizSession";
import type { QuestionSet } from "@quiz-platform/shared-types";
import ResumeQuestion from "@/features/quiz-import/components/ResumeQuestion";

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"json" | "pdf">("json");
  const { sessions, isLoading } = useActiveQuizSessions();

  const handleValidData = async (data: QuestionSet) => {
    const id = crypto.randomUUID();
    const dataWithIds = {
      ...data,
      questions: data.questions.map((q, idx) => ({
        ...q,
        id: q.id || `q${idx + 1}`,
      })),
    };
    await quizStorage.save(id, dataWithIds);
    router.push(`/quiz/${id}?source=local`);
  };

  const handleDiscard = (id: string) => {
    clearSession(id);
    quizStorage.remove(id);
    // Remove from UI immediately by reloading (sessions are read once on mount)
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import & Generate Soal</h2>
        <p className="text-slate-600">
          Buat kuis baru dengan mengunggah materi PDF agar AI kami membuatkan
          soal otomatis, atau import secara manual menggunakan JSON.
        </p>
      </div>

      {/* ── Resume banner ── */}
      {!isLoading && sessions.length > 0 && (
        <ResumeQuestion sessions={sessions} handleDiscard={handleDiscard} />
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("json")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "json"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Import JSON (Lokal)
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "pdf"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Generate dari PDF (AI)
        </button>
      </div>

      {activeTab === "json" ? (
        <div className="space-y-6">
          <JsonPasteInput onValidData={handleValidData} />

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h3 className="font-semibold text-blue-800 mb-2">
              Format JSON yang Diterima
            </h3>
            <pre className="bg-white p-3 rounded border border-blue-100 text-xs text-slate-700 overflow-x-auto">
              {`{
  "title": "Quiz Pengetahuan Umum",
  "description": "Latihan soal dasar",
  "questions": [
    {
      "question": "Ibukota Indonesia adalah?",
      "options": {
        "a": "Bandung",
        "b": "Jakarta",
        "c": "Surabaya"
      },
      "correctAnswer": "b",
      "explanation": "Jakarta adalah ibukota negara Republik Indonesia."
    }
  ]
}`}
            </pre>
          </div>
        </div>
      ) : (
        <PdfUploadInput />
      )}
    </div>
  );
}
