"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, confirmSignUp, signIn } from "aws-amplify/auth";

type Mode = "signIn" | "signUp" | "confirm";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ username: email, password });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      setMode("confirm");
    } catch (err: any) {
      setError(err.message ?? "サインアップに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setMode("signIn");
    } catch (err: any) {
      setError(err.message ?? "確認コードが正しくありません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm bg-paper-light border border-accent-soft rounded-3xl shadow-[0_6px_20px_rgba(74,55,40,0.15)] p-8">
        <h1 className="font-heading text-2xl text-ink mb-6 text-center">
          {mode === "signIn" && "ログイン"}
          {mode === "signUp" && "新規登録"}
          {mode === "confirm" && "確認コード入力"}
        </h1>

        {mode === "confirm" ? (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <p className="text-sm text-sepia">
              {email} 宛に届いた確認コードを入力してください
            </p>
            <input
              type="text"
              placeholder="確認コード"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-accent-soft rounded-full px-4 py-2 bg-paper text-ink"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-paper-light font-heading rounded-full py-2.5 hover:opacity-90 transition disabled:opacity-40"
            >
              確認する
            </button>
          </form>
        ) : (
          <form
            onSubmit={mode === "signIn" ? handleSignIn : handleSignUp}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-accent-soft rounded-full px-4 py-2 bg-paper text-ink"
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-accent-soft rounded-full px-4 py-2 bg-paper text-ink"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-paper-light font-heading rounded-full py-2.5 hover:opacity-90 transition disabled:opacity-40"
            >
              {mode === "signIn" ? "ログイン" : "登録する"}
            </button>
          </form>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      
        )}
      </div>
    </main>
  );
}