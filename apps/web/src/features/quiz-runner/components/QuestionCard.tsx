import { OptionButton } from "./OptionButton";
import { ExplanationPanel } from "./ExplanationPanel";
import type { QuestionItem, OptionKey } from "@quiz-platform/shared-types";
import type { AnswerRecord } from "../hooks/useQuizSession";

interface QuestionCardProps {
  question: QuestionItem;
  answerRecord?: AnswerRecord;
  onSelectOption: (key: OptionKey) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function QuestionCard({
  question,
  answerRecord,
  onSelectOption,
  onNext,
  isLastQuestion
}: QuestionCardProps) {
  const hasAnswered = !!answerRecord;
  const optionsEntries = Object.entries(question.options) as [OptionKey, string][];

  return (
    <div className="w-full bg-[var(--color-surface)] p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
        {question.question}
      </h3>

      <div className="space-y-3">
        {optionsEntries.map(([key, text]) => (
          <OptionButton
            key={key as OptionKey}
            optionKey={key as OptionKey}
            text={text}
            isSelected={answerRecord?.selectedKey === key}
            isCorrectOption={question.correctAnswer === key}
            hasAnswered={hasAnswered}
            onClick={() => onSelectOption(key as OptionKey)}
          />
        ))}
      </div>

      {hasAnswered && (
        <ExplanationPanel 
          explanation={question.explanation} 
          isCorrect={answerRecord.isCorrect} 
        />
      )}

      {hasAnswered && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {isLastQuestion ? "Lihat Hasil Akhir" : "Soal Selanjutnya"}
          </button>
        </div>
      )}
    </div>
  );
}
