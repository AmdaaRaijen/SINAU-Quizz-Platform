# Interactive Quiz Platform

Platform web interaktif untuk mengonversi JSON soal pilihan ganda menjadi pengalaman kuis yang bisa dimainkan langsung dari browser.

## Tech Stack
- Frontend: Next.js (App Router), TailwindCSS v4
- Backend: Express.js
- Database: PostgreSQL (dipersiapkan untuk Fase 2)
- Monorepo: Turborepo + pnpm

## Persiapan & Menjalankan Aplikasi (Lokal)

Pastikan Anda memiliki [Docker](https://www.docker.com/) terinstal di mesin Anda.

1. Jalankan perintah berikut di root folder project:
   ```bash
   docker compose up -d --build
   ```

2. Tunggu beberapa saat sampai semua container (postgres, api, web) berjalan.
3. Akses aplikasi frontend di: **[http://localhost:3000](http://localhost:3000)**
4. Backend API berjalan di: **[http://localhost:4000](http://localhost:4000)**

## Format JSON Soal

Anda dapat membuat soal Anda sendiri dengan format JSON berikut. Simpan ke file `.json` lalu upload di halaman utama aplikasi.

```json
{
  "title": "Quiz Pengetahuan Umum",
  "description": "Latihan soal dasar",
  "questions": [
    {
      "question": "Siapakah penemu bola lampu pijar?",
      "options": {
        "a": "Nikola Tesla",
        "b": "Thomas Alva Edison",
        "c": "Albert Einstein"
      },
      "correctAnswer": "b",
      "explanation": "Thomas Alva Edison mematenkan bola lampu pijar komersial yang praktis."
    }
  ]
}
```

### Aturan Format:
- `title`: Wajib diisi.
- `questions`: Array yang berisi soal-soal. Minimal 1 soal.
- `options`: Object berisi opsi jawaban, minimal 2 opsi. Key harus berurutan (misal: "a", "b", "c").
- `correctAnswer`: Wajib berupa salah satu key yang ada di `options` (contoh: "b").
- `explanation`: Penjelasan opsional untuk ditampilkan setelah menjawab.
