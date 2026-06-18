import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h2 className="text-4xl font-extrabold tracking-tight">
        Selamat Datang di Quiz Platform
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl">
        Ubah file JSON soal pilihan ganda Anda menjadi pengalaman kuis interaktif 
        dengan mudah. Tanpa perlu mendaftar, langsung mainkan!
      </p>
      
      <div className="pt-8">
        <Link 
          href="/import" 
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-transform hover:-translate-y-1"
        >
          Mulai Import Soal
        </Link>
      </div>
    </div>
  );
}
