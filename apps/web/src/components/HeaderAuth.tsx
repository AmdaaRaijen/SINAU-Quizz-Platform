"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

export function HeaderAuth() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-slate-600">Hai, {user.name || user.email}</span>
        <button onClick={logout} className="text-[var(--color-primary)] hover:underline">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      <Link href="/login" className="text-slate-600 hover:text-[var(--color-primary)]">Login</Link>
      <Link href="/register" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">Register</Link>
    </div>
  );
}
