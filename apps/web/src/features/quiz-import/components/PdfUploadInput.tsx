"use client";

import { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PdfUploadInput() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        setError("Ukuran file lebih dari 10MB");
        return;
      }

      if (e.target.files[0].type !== "application/pdf") {
        setError("File harus berupa PDF");
        return;
      }

      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file lebih dari 10MB");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("File harus berupa PDF");
      return;
    }

    setLoading(true);
    setError("");
    setStatusText("Mengunggah PDF dan Mengekstrak teks...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/pdf-quiz/generate`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengolah PDF");
      }

      setStatusText("Menyimpan ke database...");
      const result = await res.json();

      router.push(`/quiz/${result.id}?source=api`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  if (authLoading) return <div className="p-6 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center mt-6">
        <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
        <h3 className="font-medium text-yellow-800 mb-2">Login Diperlukan</h3>
        <p className="text-yellow-700 mb-4 text-sm">
          Fitur Generate Soal AI memerlukan akun. Silakan login atau register
          terlebih dahulu.
        </p>
        <Link
          href="/login"
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 inline-block"
        >
          Login ke Akun Anda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-slate-50">
        <Upload className="text-slate-400 mb-4" size={48} />
        <h3 className="font-medium text-slate-700 mb-1">
          Pilih file PDF materi Anda
        </h3>
        <p className="text-sm text-slate-500 mb-4">Maksimal ukuran file 10MB</p>

        <input
          type="file"
          id="pdf-upload"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-md transition-colors"
        >
          Browse File
        </label>

        {file && (
          <div className="mt-4 p-2 bg-blue-50 text-blue-800 border border-blue-200 rounded text-sm w-full break-all">
            File terpilih: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
            MB)
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm flex items-center gap-3">
          <Loader2 className="animate-spin" size={18} />
          {statusText}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 ${
            file && !loading
              ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Memproses AI..." : "Generate Soal AI"}
        </button>
      </div>
    </div>
  );
}
