"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../useAuth";

export default function DeleteAlbumButton({ album }: { album: string }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `アルバム「${album}」を中の写真ごと削除しますか？元に戻せません。`
    );
    if (!confirmed) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ album }),
    });
    router.push("/");
  };

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-700 border border-red-300 rounded-full px-4 py-1 hover:bg-red-50"
    >
      このアルバムを削除
    </button>
  );
}