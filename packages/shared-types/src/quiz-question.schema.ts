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

export function formatQuestionSetError(error: z.ZodError): Array<{ path: string; message: string }> {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
}
