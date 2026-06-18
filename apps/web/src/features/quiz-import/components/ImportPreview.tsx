import { CheckCircle2 } from "lucide-react";
import { type QuestionSet } from "@quiz-platform/shared-types";

interface ImportPreviewProps {
  data: QuestionSet;
}

export function ImportPreview({ data }: ImportPreviewProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
        <CheckCircle2 size={20} />
        <h3>JSON Valid!</h3>
      </div>
      <div className="text-sm text-green-800">
        <p><strong>Judul:</strong> {data.title}</p>
        {data.description && <p><strong>Deskripsi:</strong> {data.description}</p>}
        <p><strong>Jumlah Soal:</strong> {data.questions.length} soal</p>
      </div>
    </div>
  );
}
