"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";

export default function UploadPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data.albums);
        if (data.albums.length > 0) {
          setSelectedAlbum(data.albums[0]);
        } else {
          setIsAddingNew(true);
        }
      });
  }, []);

  const handleSelectChange = (value: string) => {
    if (value === "__new__") {
      setIsAddingNew(true);
      setSelectedAlbum("");
    } else {
      setIsAddingNew(false);
      setSelectedAlbum(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const album = isAddingNew ? newAlbumName.trim() : selectedAlbum;
    if (!file || !album) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          album,
        }),
      });
      const { uploadUrl, fileUrl } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setUploadedUrl(fileUrl);

      if (isAddingNew && !albums.includes(album)) {
        setAlbums((prev) => [...prev, album].sort());
        setSelectedAlbum(album);
        setIsAddingNew(false);
        setNewAlbumName("");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoggedIn !== true) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sepia">確認中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-paper-light border border-accent-soft rounded-3xl shadow-[0_6px_20px_rgba(74,55,40,0.15)] p-8">
        <h1 className="font-heading text-2xl text-ink mb-6 text-center">
          写真をアップロード
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-sm text-sepia">
            アルバム
            {!isAddingNew ? (
              <select
                value={selectedAlbum}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="mt-1 w-full border border-accent-soft rounded-full px-4 py-2 bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {albums.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="__new__">＋ 新しいアルバムを追加</option>
              </select>
            ) : (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="新しいアルバム名"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="flex-1 border border-accent-soft rounded-full px-4 py-2 bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                {albums.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setSelectedAlbum(albums[0]);
                    }}
                    className="text-xs text-sepia px-3 rounded-full border border-accent-soft"
                  >
                    一覧に戻る
                  </button>
                )}
              </div>
            )}
          </div>

          <label className="text-sm text-sepia">
            写真
            <div className="mt-1 border-2 border-dashed border-accent-soft rounded-2xl p-6 text-center bg-paper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-sepia file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-accent-soft file:text-ink file:cursor-pointer"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={!file || isUploading || (isAddingNew && !newAlbumName.trim())}
            className="bg-accent text-paper-light font-heading rounded-full py-2.5 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? "アップロード中…" : "アップロード"}
          </button>
        </form>

        {uploadedUrl && (
          <div className="mt-8 border-t border-accent-soft pt-6">
            <p className="text-sm text-sepia mb-3">アップロード成功</p>
            <img
              src={uploadedUrl}
              alt="uploaded"
              className="w-full rounded-2xl photo-vintage shadow-sm"
            />
          </div>
        )}
      </div>
    </main>
  );
}