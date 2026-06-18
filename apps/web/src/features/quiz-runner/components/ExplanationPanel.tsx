import { Info } from "lucide-react";

interface ExplanationPanelProps {
  explanation?: string | null;
  isCorrect: boolean;
}

export function ExplanationPanel({ explanation, isCorrect }: ExplanationPanelProps) {
  return (
    <div className={`mt-6 p-5 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start gap-3">
        <Info className={`mt-0.5 shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} size={20} />
        <div>
          <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? "Jawaban Anda Benar!" : "Jawaban Anda Salah!"}
          </h4>
          {explanation ? (
            <p className="text-slate-700 text-sm leading-relaxed mt-2">{explanation}</p>
          ) : (
            <p className="text-slate-500 text-sm italic mt-2">Tidak ada penjelasan untuk soal ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
