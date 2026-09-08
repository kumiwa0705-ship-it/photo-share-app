"use client";

import Link from "next/link";
import { useAuth } from "./useAuth";

export default function Header() {
  const { isLoggedIn, email, signOut } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="font-heading text-3xl text-ink">Photo Share</h1>

      <div className="flex items-center gap-3">
        {isLoggedIn && (
          <Link
            href="/upload"
            className="bg-accent text-paper-light font-heading text-sm rounded-full px-5 py-2 hover:opacity-90 transition"
          >
            ＋ アップロード
          </Link>
        )}

        {isLoggedIn === false && (
          <Link
            href="/login"
            className="text-sm text-sepia border border-accent-soft rounded-full px-4 py-2 hover:bg-accent-soft"
          >
            ログイン
          </Link>
        )}

        {isLoggedIn && (
          <button
            onClick={signOut}
            className="text-sm text-sepia border border-accent-soft rounded-full px-4 py-2 hover:bg-accent-soft"
          >
            ログアウト
          </button>
        )}
      </div>
    </div>
  );
}