"use client";

import { useRouter } from "next/navigation";
import { JsonPasteInput } from "@/features/quiz-import/components/JsonPasteInput";
import { quizStorage } from "@/lib/storage/quiz-storage";
import type { QuestionSet } from "@quiz-platform/shared-types";

export default function ImportPage() {
  const router = useRouter();

  const handleValidData = async (data: QuestionSet) => {
    // Generate simple UUID-like id for Phase 1 local storage
    const id = crypto.randomUUID();
    
    // Auto-generate ids for questions if missing
    const dataWithIds = {
      ...data,
      questions: data.questions.map((q, idx) => ({
        ...q,
        id: q.id || `q${idx + 1}`
      }))
    };

    await quizStorage.save(id, dataWithIds);
    router.push(`/quiz/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import Soal Quiz</h2>
        <p className="text-slate-600">
          Tempelkan JSON yang berisi definisi set soal Anda, atau upload file berektensi .json. 
          Sistem akan memvalidasi strukturnya secara otomatis.
        </p>
      </div>

      <JsonPasteInput onValidData={handleValidData} />
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
        <h3 className="font-semibold text-blue-800 mb-2">Format JSON yang Diterima</h3>
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
  );
}
