interface ScoreSummaryProps {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}

export function ScoreSummary({ correctCount, totalQuestions, percentage }: ScoreSummaryProps) {
  let message = "Kerja bagus!";
  let colorClass = "text-green-600";
  
  if (percentage === 100) {
    message = "Sempurna! Luar biasa!";
    colorClass = "text-yellow-600";
  } else if (percentage < 50) {
    message = "Jangan menyerah, coba lagi!";
    colorClass = "text-red-600";
  }

  return (
    <div className="bg-[var(--color-surface)] border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Hasil Quiz</h2>
      
      <div className="flex justify-center items-center mb-6">
        <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-slate-100">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="fill-transparent stroke-current text-[var(--color-primary)] transition-all duration-1000 ease-out"
              strokeWidth="8%"
              strokeDasharray="289%" /* 2 * pi * r (approx 46 * 2 * 3.14) = 289 */
              strokeDashoffset={`${289 - (289 * percentage) / 100}%`}
            />
          </svg>
          <div className="text-center">
            <span className="text-4xl font-extrabold text-slate-800">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className={`text-xl font-bold ${colorClass}`}>{message}</p>
        <p className="text-slate-600 font-medium">
          Anda menjawab benar <span className="text-slate-900 font-bold">{correctCount}</span> dari <span className="text-slate-900 font-bold">{totalQuestions}</span> soal
        </p>
      </div>
    </div>
  );
}
