"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { parseAndValidateJson } from "../utils/parseAndValidate";
import { ValidationErrorList } from "./ValidationErrorList";
import { ImportPreview } from "./ImportPreview";
import type { QuestionSet } from "@quiz-platform/shared-types";

interface JsonPasteInputProps {
  onValidData: (data: QuestionSet) => void;
}

export function JsonPasteInput({ onValidData }: JsonPasteInputProps) {
  const [error, setError] = useState("");

  const [jsonText, setJsonText] = useState("");
  const [validationResult, setValidationResult] = useState<ReturnType<
    typeof parseAndValidateJson
  > | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);

    if (!text.trim()) {
      setValidationResult(null);
      return;
    }

    const result = parseAndValidateJson(text);
    setValidationResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file lebih dari 10MB");
      return;
    }

    if (file.type !== "application/json") {
      setError("File harus berupa JSON");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      setValidationResult(parseAndValidateJson(text));
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = "";
  };

  const handleStartQuiz = () => {
    if (validationResult?.success) {
      onValidData(validationResult.data);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <label
            htmlFor="json-input"
            className="block text-sm font-medium text-slate-700"
          >
            Paste JSON soal di sini:
          </label>
          <div>
            <input
              type="file"
              id="file-upload"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
            >
              <Upload size={16} />
              Upload File .json
            </label>
          </div>
        </div>

        <textarea
          id="json-input"
          value={jsonText}
          onChange={handleTextChange}
          className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none resize-y"
          placeholder='{"title": "Kuis Saya", "questions": [...]}'
        />

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {validationResult && !validationResult.success && (
          <ValidationErrorList errors={validationResult.errors} />
        )}

        {validationResult && validationResult.success && (
          <ImportPreview data={validationResult.data} />
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleStartQuiz}
            disabled={!validationResult?.success}
            className={`px-6 py-3 rounded-lg font-semibold shadow-sm transition-all ${
              validationResult?.success
                ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
