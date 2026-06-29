import { useRouter } from "next/navigation";
import { ActiveSession } from "../hooks/useActiveQuizSessions";

export default function ResumeQuestion({
  sessions,
  handleDiscard,
}: {
  sessions: ActiveSession[];
  handleDiscard: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 truncate">
              {s.title}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {s.answeredCount} dari {s.totalQuestions} soal terjawab — kuis
              belum selesai
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => router.push(`/quiz/${s.id}?source=local`)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
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
                  d="M14.752 11.168l-6.586-3.796A1 1 0 006.5 8.232v7.536a1 1 0 001.666.748l6.586-3.796a1 1 0 000-1.552z"
                />
              </svg>
              Lanjutkan
            </button>
            <button
              onClick={() => handleDiscard(s.id)}
              className="text-sm font-medium text-amber-700 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Hapus kuis ini"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
