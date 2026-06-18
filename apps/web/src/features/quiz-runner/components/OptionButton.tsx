import { clsx } from "clsx";
import type { OptionKey } from "@quiz-platform/shared-types";
import { Check, X } from "lucide-react";

interface OptionButtonProps {
  optionKey: OptionKey;
  text: string;
  isSelected: boolean;
  isCorrectOption: boolean;
  hasAnswered: boolean;
  onClick: () => void;
}

export function OptionButton({
  optionKey,
  text,
  isSelected,
  isCorrectOption,
  hasAnswered,
  onClick
}: OptionButtonProps) {
  let stateClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
  let Icon = null;

  if (hasAnswered) {
    if (isCorrectOption) {
      stateClass = "bg-green-50 border-green-500 text-green-800";
      Icon = <Check className="text-green-600" size={20} />;
    } else if (isSelected && !isCorrectOption) {
      stateClass = "bg-red-50 border-red-500 text-red-800";
      Icon = <X className="text-red-600" size={20} />;
    } else {
      stateClass = "bg-white border-slate-200 text-slate-400 opacity-60";
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={hasAnswered}
      className={clsx(
        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
        stateClass,
        !hasAnswered && "cursor-pointer active:scale-[0.99]"
      )}
    >
      <div className="flex items-center gap-4">
        <span className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border",
          hasAnswered ? "border-transparent bg-white/50" : "bg-slate-100 border-slate-200 text-slate-500"
        )}>
          {optionKey.toUpperCase()}
        </span>
        <span className="font-medium text-base">{text}</span>
      </div>
      {Icon}
    </button>
  );
}
