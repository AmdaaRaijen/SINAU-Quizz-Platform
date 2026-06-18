# Interactive Quiz Platform — AI Agent Build Guide

> Dokumen ini adalah panduan lengkap untuk AI coding agent (Claude Code, Cursor, dll) yang akan membangun project ini dari nol. Baca seluruh dokumen sebelum mulai coding. Ikuti urutan fase yang sudah ditentukan, jangan lompat ke fitur fase belakang sebelum fase sebelumnya selesai dan jalan.

---

## 1. Project Overview

### 1.1 Apa yang dibangun

Platform web untuk mengubah soal pilihan ganda (dalam format JSON terstruktur) menjadi quiz interaktif yang bisa dikerjakan langsung di browser. User mem-paste/upload JSON soal → sistem mem-parsing → soal ditampilkan satu per satu sebagai quiz interaktif → user pilih jawaban → di akhir muncul skor dan review.

### 1.2 Goal utama

- Import soal pilihan ganda dalam format JSON yang sudah ditentukan (lihat Bagian 4).
- Generate quiz interaktif secara otomatis dari JSON tersebut — tidak perlu setup manual per soal.
- Ringan, cepat diakses dari desktop maupun mobile (responsive, minim dependency berat di frontend).
- Tahap awal (MVP) **tidak butuh login**. User langsung bisa import dan main.
- Mudah dikembangkan ke depan (auth, simpan riwayat, sharing, bank soal, dsb di fase lanjutan).

### 1.3 Non-goal (untuk MVP / Fase 1)

Supaya AI agent tidak over-engineering di awal, hal-hal ini **belum** dikerjakan di Fase 1:

- Autentikasi/login user.
- Penyimpanan soal ke database (Fase 1 hanya localStorage di browser).
- Multi-user, sharing link, kolaborasi.
- Editor visual untuk bikin soal dari nol (fokus dulu ke *import* JSON yang sudah jadi).
- Analytics, leaderboard, gamification.

Semua di atas masuk roadmap Fase 2 dan Fase 3 (lihat Bagian 9).

---

## 2. Tech Stack & Alasan Pemilihan

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | SSR/SSG untuk landing cepat, ekosistem besar, mudah dikembangkan |
| Backend | Express.js + TypeScript | Simple, fleksibel, gampang dipahami AI agent maupun developer baru |
| Database | PostgreSQL | Relational, cocok untuk data soal/quiz yang punya relasi jelas (set soal → soal → pilihan) |
| ORM | Prisma | Type-safe, migration jelas, schema jadi single source of truth, cocok untuk TypeScript end-to-end |
| Container | Docker + Docker Compose | Konsistensi environment dev/prod, gampang onboarding |
| Monorepo tool | Turborepo | Caching build/test antar package, task orchestration antar `apps/*` dan `packages/*` |
| Package manager | pnpm (dengan pnpm workspaces) | Disk-efficient, native workspace support, dipasangkan dengan Turborepo |
| Validasi schema | Zod | Validasi JSON soal di runtime (frontend saat import, backend saat terima request) — schema bisa di-share lewat package `shared` |
| State management (frontend) | React Context / Zustand (ringan) | Cukup untuk state quiz (soal aktif, jawaban, skor), tidak perlu Redux |
| Styling | Tailwind CSS | Cepat, ringan, responsive by default |

Catatan untuk AI agent: jangan menambahkan library di luar daftar ini tanpa alasan kuat. Tujuan platform ini adalah ringan — setiap dependency baru harus dipertimbangkan dampaknya ke bundle size dan kompleksitas.

---

## 3. Struktur Monorepo

```
quiz-platform/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/               # App Router pages
│   │   │   ├── components/
│   │   │   ├── features/          # Feature-based modules (lihat 3.1)
│   │   │   ├── lib/                # api client, utils
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── api/                      # Express backend
│       ├── src/
│       │   ├── modules/           # Feature-based modules (lihat 3.1)
│       │   ├── middlewares/
│       │   ├── config/
│       │   ├── db/                 # Prisma client instance
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── tsconfig.json
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── shared-types/              # Tipe TypeScript & Zod schema yang dipakai FE+BE
│   │   ├── src/
│   │   │   ├── quiz-question.schema.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/             # Konfigurasi lint bersama
│   └── tsconfig-config/           # Base tsconfig bersama
│
├── docker-compose.yml             # Orkestrasi dev: web + api + postgres
├── docker-compose.prod.yml        # Varian untuk produksi (opsional, Fase 2+)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                   # root
├── .env.example
└── README.md
```

### 3.1 Kenapa "feature-based module", bukan "layer-based"

Supaya gampang dikembangkan, baik di frontend maupun backend, kode dikelompokkan per **fitur/domain**, bukan per tipe file. Contoh di backend, daripada:

```
src/controllers/quizController.ts
src/services/quizService.ts
src/routes/quizRoutes.ts
```

Pakai:

```
src/modules/quiz-import/
  ├── quiz-import.controller.ts
  ├── quiz-import.service.ts
  ├── quiz-import.routes.ts
  ├── quiz-import.validation.ts   # Zod schema spesifik endpoint ini
  └── quiz-import.types.ts
```

Alasan: saat fitur baru ditambah (misal `quiz-attempt`, `auth`, `question-bank`), AI agent atau developer baru cukup bikin folder baru di `modules/`, tanpa harus menyentuh banyak file lintas-layer. Ini juga memudahkan penghapusan/penggantian fitur tanpa efek samping ke fitur lain.

Pola yang sama dipakai di frontend pada folder `features/`, contoh `features/quiz-import/`, `features/quiz-runner/`.

---

## 4. Format JSON Soal (Kontrak Data)

Ini adalah **kontrak resmi** yang harus diikuti user saat menyiapkan soal, dan jadi acuan utama untuk Zod schema, Prisma schema, dan UI rendering. Semua lapisan sistem (validasi frontend, validasi backend, tipe TypeScript) harus diturunkan dari satu definisi ini, ditaruh di `packages/shared-types`, supaya tidak ada drift antara FE dan BE.

### 4.1 Struktur

Satu file JSON berisi **satu set soal** (`QuestionSet`), terdiri dari metadata singkat dan array soal.

```json
{
  "title": "Quiz Struktur Data - Queue & Stack",
  "description": "Latihan soal tentang Queue, Stack, dan Linked List",
  "questions": [
    {
      "id": "q1",
      "question": "Struktur data apa yang menerapkan prinsip FIFO (First In First Out)?",
      "options": {
        "a": "Stack",
        "b": "Queue",
        "c": "Linked List",
        "d": "Tree",
        "e": "Graph"
      },
      "correctAnswer": "b",
      "explanation": "Queue menerapkan FIFO, elemen yang pertama masuk akan pertama keluar, berbeda dengan Stack yang LIFO."
    },
    {
      "id": "q2",
      "question": "Operasi apa yang digunakan untuk menambah elemen ke dalam Stack?",
      "options": {
        "a": "Enqueue",
        "b": "Dequeue",
        "c": "Push",
        "d": "Pop",
        "e": "Peek"
      },
      "correctAnswer": "c",
      "explanation": null
    }
  ]
}
```

### 4.2 Aturan field

| Field | Wajib? | Tipe | Keterangan |
|---|---|---|---|
| `title` | Ya | `string` | Judul set soal/quiz |
| `description` | Tidak | `string \| null` | Deskripsi singkat |
| `questions` | Ya | `array` | Minimal 1 soal |
| `questions[].id` | Tidak* | `string` | Identifier unik soal dalam set. Jika tidak diisi user, sistem auto-generate saat parsing |
| `questions[].question` | Ya | `string` | Teks soal |
| `questions[].options` | Ya | `object` | Key harus huruf kecil `a` sampai `e`. Minimal 2 opsi (`a`, `b`), maksimal 5 (`a`–`e`). Tidak harus selalu 5 opsi |
| `questions[].correctAnswer` | Ya | `string` | Salah satu key dari `options` (harus match, case-sensitive ke key yang ada) |
| `questions[].explanation` | Tidak | `string \| null` | Penjelasan jawaban, ditampilkan setelah user menjawab |

\* `id` tidak wajib diisi oleh user secara manual, tapi field-nya tetap ada di tipe internal setelah parsing (auto-generated jika kosong).

### 4.3 Aturan validasi penting (harus ditegakkan oleh Zod schema)

1. `options` minimal punya 2 key, maksimal 5, dan key yang dipakai harus subset dari `["a","b","c","d","e"]` — berurutan dari `a` (tidak boleh ada gap, misal `a` dan `c` tanpa `b`).
2. `correctAnswer` harus salah satu dari key yang benar-benar ada di `options` soal tersebut.
3. `questions` tidak boleh array kosong.
4. Tiap `question.question` tidak boleh string kosong.
5. Jika `id` duplikat antar soal dalam satu set, sistem auto-rename dengan suffix (`q1`, `q1-2`, dst) — jangan throw error keras di tahap ini, cukup auto-fix + tampilkan warning non-blocking ke user.

### 4.4 Mengapa format ini

- Opsi sebagai **object berkey huruf** (bukan array) dipilih supaya `correctAnswer` bisa langsung merujuk ke key yang stabil (`"b"`), bukan index array yang rawan salah hitung saat user menyusun JSON manual atau lewat AI.
- `explanation` opsional dan boleh `null` supaya user yang soalnya tidak punya pembahasan tidak perlu mengisi field dummy.
- Struktur per-set (bukan per-soal lepas) supaya satu file JSON = satu sesi quiz yang siap diimpor langsung.

### 4.5 Contoh kasus invalid yang harus ditolak dengan pesan error jelas

```json
// INVALID - correctAnswer tidak ada di options
{ "question": "...", "options": {"a": "X", "b": "Y"}, "correctAnswer": "c" }

// INVALID - options kurang dari 2
{ "question": "...", "options": {"a": "X"}, "correctAnswer": "a" }

// INVALID - gap pada key (ada c tapi tidak ada b)
{ "question": "...", "options": {"a": "X", "c": "Y"}, "correctAnswer": "a" }
```

Pesan error dari Zod harus diteruskan ke UI dalam bahasa yang bisa dipahami pengguna non-teknis, bukan raw Zod error stack. Mapping pesan error ada di `packages/shared-types` sebagai helper `formatQuestionSetError()`.

### 4.6 Implementasi Zod Schema (`packages/shared-types/src/quiz-question.schema.ts`)

```typescript
import { z } from "zod";

const OPTION_KEYS = ["a", "b", "c", "d", "e"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

export const optionsSchema = z
  .record(z.enum(OPTION_KEYS), z.string().min(1))
  .refine((opts) => Object.keys(opts).length >= 2, {
    message: "Setiap soal minimal harus punya 2 pilihan jawaban",
  })
  .refine(
    (opts) => {
      const keys = Object.keys(opts).sort();
      const expected = OPTION_KEYS.slice(0, keys.length);
      return JSON.stringify(keys) === JSON.stringify(expected);
    },
    { message: "Key pilihan jawaban harus berurutan dari 'a' tanpa ada yang terlewat" }
  );

export const questionItemSchema = z
  .object({
    id: z.string().optional(),
    question: z.string().min(1, "Teks soal tidak boleh kosong"),
    options: optionsSchema,
    correctAnswer: z.string(),
    explanation: z.string().nullable().optional(),
  })
  .refine((q) => Object.keys(q.options).includes(q.correctAnswer), {
    message: "correctAnswer harus salah satu key yang ada di options",
    path: ["correctAnswer"],
  });

export const questionSetSchema = z.object({
  title: z.string().min(1, "Judul quiz tidak boleh kosong"),
  description: z.string().nullable().optional(),
  questions: z.array(questionItemSchema).min(1, "Minimal harus ada 1 soal"),
});

export type QuestionSet = z.infer<typeof questionSetSchema>;
export type QuestionItem = z.infer<typeof questionItemSchema>;
```

Tipe ini dipakai di kedua sisi:
- **Frontend**: validasi langsung saat user paste/upload JSON, sebelum dikirim ke mana pun (instant feedback, tidak perlu round-trip ke server untuk basic validation).
- **Backend**: validasi ulang di endpoint (jangan pernah percaya validasi client saja), dan dipakai untuk shape data sebelum disimpan/diolah di Fase 2.

---

## 5. Arsitektur Frontend — Fase 1 (MVP, Tanpa Login)

### 5.1 User flow

```
Landing page ("/")
   │
   ▼
Halaman Import ("/import")
   │  - Textarea paste JSON, ATAU upload file .json
   │  - Validasi real-time pakai questionSetSchema (Zod)
   │  - Tampilkan error per-soal jika invalid (bukan cuma "JSON salah")
   │  - Tombol "Mulai Quiz" aktif hanya jika valid
   ▼
Simpan QuestionSet ke localStorage (key: `quiz:<generatedId>`)
   │
   ▼
Halaman Quiz Runner ("/quiz/[id]")
   │  - Ambil data dari localStorage berdasarkan [id]
   │  - Tampilkan soal satu per satu (progress bar: soal 3/10)
   │  - User pilih opsi → langsung lihat benar/salah + warna + explanation
   │  - Tombol "Selanjutnya"
   ▼
Halaman Hasil ("/quiz/[id]/result")
   │  - Skor akhir (jumlah benar / total, persentase)
   │  - Review semua soal: jawaban user vs jawaban benar vs explanation
   │  - Tombol "Coba Lagi" / "Import Soal Baru"
```

Catatan penting: karena belum ada DB di Fase 1, `[id]` di URL adalah ID lokal (uuid) yang dipakai sebagai key localStorage, bukan ID dari server. Ini penting supaya nanti di Fase 2, tinggal ganti sumber data dari `localStorage` ke `fetch ke API` tanpa mengubah struktur route maupun komponen — cukup ganti data layer.

### 5.2 Komponen utama (`apps/web/src/features/`)

```
features/
├── quiz-import/
│   ├── components/
│   │   ├── JsonPasteInput.tsx       # textarea + tombol upload file
│   │   ├── ValidationErrorList.tsx  # render error Zod jadi human-readable
│   │   └── ImportPreview.tsx        # preview jumlah soal terdeteksi sebelum mulai
│   ├── hooks/
│   │   └── useQuestionSetValidator.ts
│   └── utils/
│       └── parseAndValidate.ts       # wrapper around questionSetSchema.safeParse
│
├── quiz-runner/
│   ├── components/
│   │   ├── QuestionCard.tsx          # render 1 soal + opsi a-e
│   │   ├── OptionButton.tsx          # 1 tombol pilihan, handle state benar/salah/terpilih
│   │   ├── ProgressBar.tsx
│   │   └── ExplanationPanel.tsx
│   ├── hooks/
│   │   └── useQuizSession.ts         # state: currentIndex, answers[], score
│   └── utils/
│       └── scoreCalculator.ts
│
└── quiz-result/
    ├── components/
    │   ├── ScoreSummary.tsx
    │   └── ReviewList.tsx
    └── utils/
        └── exportResult.ts            # opsional: export hasil ke JSON/print
```

### 5.3 Data layer abstraction (penting untuk kemudahan migrasi ke Fase 2)

Buat satu interface storage yang diabstraksi, jangan panggil `localStorage` langsung dari komponen:

```typescript
// apps/web/src/lib/storage/quiz-storage.ts
export interface QuizStorageAdapter {
  save(id: string, data: QuestionSet): Promise<void>;
  get(id: string): Promise<QuestionSet | null>;
  list(): Promise<{ id: string; title: string }[]>;
  remove(id: string): Promise<void>;
}

// Fase 1: implementasi pakai localStorage
export class LocalStorageQuizAdapter implements QuizStorageAdapter { /* ... */ }

// Fase 2: tinggal buat ApiQuizAdapter implements QuizStorageAdapter
// yang manggil fetch() ke backend, tanpa ubah komponen React sama sekali
```

Komponen React hanya bergantung pada interface `QuizStorageAdapter`, di-inject lewat Context atau parameter hook. Ini adalah keputusan arsitektur paling penting di MVP — tanpa abstraksi ini, migrasi ke Fase 2 (database) akan butuh rewrite besar.

### 5.4 Prinsip "ringan"

- Hindari heavy UI library (no MUI/Ant Design penuh). Pakai Tailwind + komponen custom kecil.
- Lazy-load halaman quiz runner jika perlu (`next/dynamic`) hanya jika terbukti perlu — jangan premature optimization di awal.
- Hindari global state library berat. `useQuizSession` cukup pakai `useReducer` + Context lokal ke route quiz, tidak perlu Zustand kalau ternyata state-nya simple (evaluasi saat implementasi: kalau context-drilling jadi masalah, baru tambah Zustand).
- Gambar/asset minim, font system default atau 1 webfont saja.

---

## 6. Arsitektur Backend

### 6.1 Peran backend di Fase 1

Karena Fase 1 belum simpan apa pun ke DB, peran Express di Fase 1 **sengaja diminimalkan** ke:

1. **Endpoint validasi** (opsional dipakai FE, tapi disiapkan dari awal supaya kontrak schema benar-benar shared, bukan cuma di FE):
   - `POST /api/v1/question-sets/validate` — terima raw JSON, jalankan `questionSetSchema.safeParse`, kembalikan hasil valid/invalid + detail error per-field.
2. **Health check**: `GET /api/v1/health` — wajib ada dari awal untuk keperluan Docker healthcheck dan monitoring nanti.

Kenapa tetap bikin backend walau Fase 1 bisa "frontend-only"? Karena:
- Kontrak Zod schema harus dijalankan juga di server sejak awal (security: never trust client), bahkan kalau belum dipakai untuk persist data.
- Struktur folder `modules/` sudah disiapkan dari awal supaya Fase 2 (auth, persist quiz, quiz attempt history) tinggal nambah module baru, bukan bikin ulang fondasi.
- Docker Compose dari awal sudah punya 3 service (web, api, postgres) walau `postgres` belum dipakai datanya — ini supaya tim/AI agent terbiasa dengan environment penuh sejak awal dan tidak ada "migrasi besar" pas Fase 2 mulai.

### 6.2 Struktur module backend

```
apps/api/src/
├── modules/
│   ├── health/
│   │   ├── health.routes.ts
│   │   └── health.controller.ts
│   │
│   └── question-set/
│       ├── question-set.routes.ts
│       ├── question-set.controller.ts
│       ├── question-set.service.ts        # logic validasi, nanti logic persist di Fase 2
│       └── question-set.validation.ts     # import dari packages/shared-types
│
├── middlewares/
│   ├── error-handler.middleware.ts        # 1 tempat terpusat untuk format error response
│   ├── request-logger.middleware.ts
│   └── rate-limiter.middleware.ts          # cegah abuse endpoint validate (public, no auth)
│
├── config/
│   ├── env.ts                              # validasi env vars pakai Zod juga
│   └── cors.ts
│
├── db/
│   └── prisma-client.ts                    # singleton Prisma client (disiapkan, dipakai aktif mulai Fase 2)
│
├── app.ts                                  # setup express app, middleware, routes
└── server.ts                               # entrypoint, listen port
```

### 6.3 Kontrak API Fase 1

**`POST /api/v1/question-sets/validate`**

Request body: raw JSON sesuai format Bagian 4.

Response sukses (200):
```json
{
  "valid": true,
  "data": {
    "title": "...",
    "questionCount": 10
  }
}
```

Response gagal validasi (422):
```json
{
  "valid": false,
  "errors": [
    { "path": "questions.2.correctAnswer", "message": "correctAnswer harus salah satu key yang ada di options" },
    { "path": "questions.5.options", "message": "Setiap soal minimal harus punya 2 pilihan jawaban" }
  ]
}
```

**`GET /api/v1/health`**
```json
{ "status": "ok", "uptime": 12345, "db": "connected" }
```

### 6.4 Error handling convention

Semua error backend lewat satu format konsisten, ditangani middleware terpusat (`error-handler.middleware.ts`), supaya frontend hanya perlu satu cara parsing error di seluruh aplikasi:

```typescript
// Format error response standar di seluruh API
interface ApiErrorResponse {
  valid?: false;
  error: {
    code: string;        // contoh: "VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"
    message: string;
    details?: unknown;
  };
}
```

Gunakan custom error class (`AppError`) yang di-throw dari service layer, ditangkap middleware, jangan `try/catch` manual berulang di tiap controller.

### 6.5 Rencana endpoint Fase 2 (sudah disiapkan strukturnya, belum diimplementasi di Fase 1)

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registrasi user |
| `POST` | `/api/v1/auth/login` | Login, return JWT/session |
| `POST` | `/api/v1/question-sets` | Simpan question set ke DB (milik user login) |
| `GET` | `/api/v1/question-sets` | List question set milik user |
| `GET` | `/api/v1/question-sets/:id` | Detail satu set |
| `POST` | `/api/v1/question-sets/:id/attempts` | Submit hasil pengerjaan quiz |
| `GET` | `/api/v1/question-sets/:id/attempts` | Riwayat pengerjaan |
| `POST` | `/api/v1/question-sets/:id/share` | Generate share link publik |

---

## 7. Database Schema (Disiapkan dari Fase 1, Aktif Dipakai Fase 2)

Walau Fase 1 belum menyimpan apa-apa ke Postgres, schema Prisma sebaiknya **sudah ditulis dari awal** (tidak perlu di-migrate/dijalankan dulu di Fase 1 kalau memang belum dipakai), supaya:
- Mental model data konsisten dari awal antara FE, BE, dan DB.
- Fase 2 tinggal `prisma migrate dev`, tidak perlu desain ulang dari nol.

### 7.1 ERD ringkas

```
User (Fase 2)
  │ 1
  │
  │ N
QuestionSet ──────┐
  │ 1              │ 1
  │                │
  │ N              │ N
Question      QuizAttempt
  │ 1               │ 1
  │                 │
  │ N               │ N
QuestionOption   AttemptAnswer
```

### 7.2 `apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== Fase 2: Auth =====
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String
  name          String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  questionSets  QuestionSet[]
  attempts      QuizAttempt[]

  @@map("users")
}

// ===== Core domain =====
model QuestionSet {
  id           String        @id @default(uuid())
  title        String
  description  String?
  // ownerId nullable supaya tetap kompatibel dengan skenario "anonymous import"
  // jika nanti Fase 2 ingin tetap mendukung guest mode sebagian
  ownerId      String?
  owner        User?         @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  isPublic     Boolean       @default(false)
  shareSlug    String?       @unique   // dipakai untuk fitur share link, Fase 3

  questions    Question[]
  attempts     QuizAttempt[]

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([ownerId])
  @@map("question_sets")
}

model Question {
  id              String          @id @default(uuid())
  questionSetId   String
  questionSet     QuestionSet     @relation(fields: [questionSetId], references: [id], onDelete: Cascade)

  orderIndex      Int             // urutan soal dalam set, menjaga urutan asli JSON
  text            String
  correctOptionId String?         // diisi setelah options dibuat (lihat catatan di bawah)
  explanation     String?

  options         QuestionOption[]
  answers         AttemptAnswer[]

  @@index([questionSetId])
  @@map("questions")
}

model QuestionOption {
  id           String     @id @default(uuid())
  questionId   String
  question     Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)

  optionKey    String     // "a" | "b" | "c" | "d" | "e"
  text         String

  @@unique([questionId, optionKey])
  @@map("question_options")
}

// ===== Fase 2: Riwayat pengerjaan =====
model QuizAttempt {
  id              String          @id @default(uuid())
  questionSetId   String
  questionSet     QuestionSet     @relation(fields: [questionSetId], references: [id], onDelete: Cascade)

  userId          String?         // nullable: tetap dukung attempt anonim jika diperlukan
  user            User?           @relation(fields: [userId], references: [id], onDelete: SetNull)

  score           Int             // jumlah benar
  totalQuestions  Int
  startedAt       DateTime        @default(now())
  finishedAt      DateTime?

  answers         AttemptAnswer[]

  @@index([questionSetId])
  @@index([userId])
  @@map("quiz_attempts")
}

model AttemptAnswer {
  id            String        @id @default(uuid())
  attemptId     String
  attempt       QuizAttempt   @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  questionId    String
  question      Question      @relation(fields: [questionId], references: [id], onDelete: Cascade)

  selectedKey   String        // "a"-"e", jawaban yang dipilih user
  isCorrect     Boolean

  @@unique([attemptId, questionId])
  @@map("attempt_answers")
}
```

Catatan desain:
- `Question.correctOptionId` disimpan sebagai referensi opsional ke `QuestionOption.id` (bukan langsung `optionKey`) supaya integritas data terjaga di level DB — tapi karena ada circular dependency creation order (Question harus ada dulu sebelum Option, tapi correctOptionId butuh Option), praktiknya: insert Question dulu tanpa correctOptionId → insert semua Option → update Question.correctOptionId. Alternatif lebih simpel: simpan `correctOptionKey: String` langsung di tabel `Question` (tanpa FK), trade-off sedikit kurang strict tapi insert jadi 1 pass. **Rekomendasi**: pakai opsi simpel ini (`correctOptionKey` sebagai string `"a"-"e"`) untuk Fase 2 awal, baru pertimbangkan FK kalau benar-benar butuh integrity check di level DB.
- Semua relasi pakai `onDelete: Cascade` di sisi anak supaya hapus 1 QuestionSet otomatis bersih ke semua Question, Option, dan Attempt terkait — tidak ada orphan row.
- `shareSlug` dan `isPublic` sudah disiapkan dari Fase 2 untuk antisipasi fitur share link di Fase 3, tapi tidak wajib dipakai dulu.

---

## 8. Docker & Environment Setup

### 8.1 `docker-compose.yml` (development)

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: quiz_user
      POSTGRES_PASSWORD: quiz_password
      POSTGRES_DB: quiz_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quiz_user -d quiz_platform"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: development
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql://quiz_user:quiz_password@postgres:5432/quiz_platform
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/api:/app/apps/api
      - ./packages:/app/packages
      - /app/node_modules
    command: pnpm --filter api dev

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: development
    restart: unless-stopped
    env_file: .env
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app/apps/web
      - ./packages:/app/packages
      - /app/node_modules
    command: pnpm --filter web dev

volumes:
  postgres_data:
```

### 8.2 `apps/api/Dockerfile` (multi-stage)

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS development
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
EXPOSE 4000
CMD ["pnpm", "--filter", "api", "dev"]

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
RUN pnpm --filter api build

FROM base AS production
ENV NODE_ENV=production
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
```

### 8.3 `apps/web/Dockerfile` (multi-stage)

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS development
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
RUN pnpm --filter web build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

Catatan: aktifkan `output: "standalone"` di `next.config.ts` agar build production Docker image minimal (tidak ikut bawa seluruh `node_modules` dev).

### 8.4 `.env.example` (root)

```env
# Postgres
POSTGRES_USER=quiz_user
POSTGRES_PASSWORD=quiz_password
POSTGRES_DB=quiz_platform
DATABASE_URL=postgresql://quiz_user:quiz_password@localhost:5432/quiz_platform

# API
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 8.5 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 8.6 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## 9. Roadmap Fase

### Fase 1 — MVP (fokus saat ini)
- [ ] Setup monorepo (Turborepo + pnpm workspaces)
- [ ] Setup Docker Compose (web, api, postgres — postgres belum dipakai datanya)
- [ ] `packages/shared-types`: Zod schema `QuestionSet` + tipe TypeScript
- [ ] Backend: endpoint `POST /api/v1/question-sets/validate`, `GET /api/v1/health`
- [ ] Frontend: halaman Import (paste/upload JSON + validasi + preview)
- [ ] Frontend: `QuizStorageAdapter` interface + `LocalStorageQuizAdapter`
- [ ] Frontend: Quiz Runner (tampil soal, pilih jawaban, skor)
- [ ] Frontend: halaman Hasil (skor + review jawaban)
- [ ] Responsive check di mobile (viewport kecil, touch target tombol opsi cukup besar)
- [ ] README dengan instruksi `docker compose up` untuk dev

### Fase 2 — Auth & Persistensi
- [ ] Prisma migrate: jalankan schema di Bagian 7 ke Postgres
- [ ] Auth: register/login (JWT atau session-based — tentukan saat mulai Fase 2, evaluasi kebutuhan refresh token)
- [ ] Endpoint `POST/GET /api/v1/question-sets` (CRUD, terasosiasi ke user login)
- [ ] `ApiQuizAdapter implements QuizStorageAdapter` di frontend — ganti sumber data tanpa ubah komponen quiz runner
- [ ] Migrasi data dari localStorage existing user ke akun setelah login (opsional, nice-to-have)
- [ ] Riwayat pengerjaan quiz (`QuizAttempt`)

### Fase 3 — Sharing & Pengembangan Lanjutan
- [ ] Share link publik (`shareSlug`) — orang lain bisa kerjakan quiz tanpa login
- [ ] Question bank / kategori / tag soal
- [ ] Import dari format lain (convert ke JSON kontrak) — misal CSV, atau bantuan AI convert teks soal mentah ke JSON terstruktur
- [ ] Mode timer (per soal / total)
- [ ] Analytics ringan (soal mana yang paling sering salah)
- [ ] Export hasil quiz ke PDF

---

## 10. Urutan Implementasi yang Disarankan untuk AI Agent

Ikuti urutan ini secara linear. Jangan implementasi fitur frontend sebelum kontrak schema (`shared-types`) selesai dan ditest, karena semua lapisan lain bergantung padanya.

1. **Bootstrap monorepo**: init root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, struktur folder kosong sesuai Bagian 3.
2. **`packages/shared-types`**: implementasi Zod schema (Bagian 4.6), export tipe, tulis unit test sederhana untuk kasus valid/invalid (Bagian 4.5) sebelum lanjut.
3. **`apps/api` skeleton**: Express app dasar, middleware error handler, endpoint health check. Pastikan `pnpm --filter api dev` jalan.
4. **`apps/api` endpoint validate**: konsumsi `questionSetSchema` dari shared-types, test pakai contoh JSON valid dan invalid dari Bagian 4.
5. **Docker Compose dev**: pastikan `docker compose up` menjalankan ketiga service, `api` bisa connect ke `postgres` (cek lewat health check `db: connected`), `web` bisa fetch ke `api`.
6. **`apps/web` skeleton**: Next.js App Router dasar, Tailwind setup, landing page sederhana, layout dasar (header minimal, container responsive).
7. **Fitur Import**: komponen `JsonPasteInput`, validasi client-side pakai schema yang sama dari shared-types, tampilkan error per-field, preview jumlah soal.
8. **`QuizStorageAdapter` + `LocalStorageQuizAdapter`**: implementasi dan test manual (save → get → list → remove).
9. **Fitur Quiz Runner**: render soal dari data tersimpan, handle pilih jawaban, hitung skor, progress bar.
10. **Fitur Hasil**: skor akhir + review.
11. **Responsive pass**: test manual di breakpoint mobile (375px), tablet (768px), desktop (1280px+). Pastikan tombol opsi nyaman ditekan di touchscreen (minimal area tap 44x44px).
12. **Polish error states**: JSON kosong, JSON malformed (bukan JSON valid sama sekali), file upload bukan `.json`, dsb — semua harus ada pesan jelas, tidak ada blank screen atau unhandled exception.
13. **README**: instruksi setup lokal (`docker compose up`, akses `localhost:3000`), instruksi format JSON untuk user (boleh link balik ke Bagian 4 dokumen ini atau salin ringkasannya).

Setelah ke-13 poin di atas selesai dan bisa dijalankan end-to-end (import JSON → kerjakan quiz → lihat hasil, semua di `localhost:3000` lewat Docker), Fase 1 dianggap selesai. Baru lanjut ke Fase 2 sesuai Bagian 9.

---

## 11. Prinsip Umum yang Harus Dipegang Sepanjang Development

- **Single source of truth untuk schema soal**: jangan duplikasi definisi tipe `QuestionSet` di frontend dan backend secara manual — selalu import dari `packages/shared-types`.
- **Jangan persist apa pun ke Postgres di Fase 1** kecuali untuk keperluan testing/development lokal yang sengaja. Tujuannya supaya scope MVP tetap kecil dan cepat dikerjakan.
- **Abstraksi storage di frontend wajib ada sejak awal** (Bagian 5.3) — ini investasi kecil di awal yang menghindari rewrite besar di Fase 2.
- **Validasi dobel**: client-side untuk UX cepat, server-side untuk keamanan/integritas data — jangan skip salah satu.
- **Modul, bukan layer**: setiap fitur baru = folder baru di `modules/` (backend) atau `features/` (frontend), bukan menyebar file ke folder `controllers/`, `services/` global.
- **Setiap dependency baru dipertimbangkan dampak ke bundle size**, sesuai prinsip "platform ringan" dari awal requirement user.
