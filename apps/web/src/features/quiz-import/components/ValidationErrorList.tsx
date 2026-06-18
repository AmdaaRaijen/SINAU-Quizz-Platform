import { AlertCircle } from "lucide-react";

interface ValidationErrorListProps {
  errors: Array<{ path: string; message: string }>;
}

export function ValidationErrorList({ errors }: ValidationErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
        <AlertCircle size={20} />
        <h3>Ditemukan {errors.length} masalah pada JSON:</h3>
      </div>
      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
        {errors.map((error, idx) => (
          <li key={idx}>
            <span className="font-mono bg-red-100 px-1 py-0.5 rounded text-xs">{error.path}</span>
            {" "}- {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
