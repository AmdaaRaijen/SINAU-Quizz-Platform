import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { HeaderAuth } from "@/components/HeaderAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interactive Quiz Platform",
  description: "Upload and play interactive quizzes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
          <header className="bg-[var(--color-surface)] shadow-sm py-4">
            <div className="container mx-auto px-4 max-w-4xl flex justify-between items-center">
              <h1 className="text-xl font-bold text-[var(--color-primary)]">Quiz Platform</h1>
              <HeaderAuth />
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
            {children}
          </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
