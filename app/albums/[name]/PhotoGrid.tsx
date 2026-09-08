"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../useAuth";

type Photo = { key: string; url: string };

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [movingKey, setMovingKey] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleMove = async (sourceKey: string) => {
    if (!destination.trim()) return;
    await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceKey, destinationAlbum: destination }),
    });
    setMovingKey(null);
    setDestination("");
    router.refresh();
  };

  const handleDelete = async (key: string) => {
    const confirmed = window.confirm("この写真を削除しますか？元に戻せません。");
    if (!confirmed) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    router.refresh();
  };

  const handleDownload = async (photo: Photo) => {
    setIsDownloading(true);
    try {
      const res = await fetch(photo.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = photo.key.split("/").pop() || "photo.jpg";
      link.click();

      URL.revokeObjectURL(blobUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.key}
            className="mb-4 break-inside-avoid rounded-2xl bg-paper-light border border-accent-soft shadow-sm overflow-hidden"
          >
            <img
              src={photo.url}
              alt=""
              onClick={() => setPreviewPhoto(photo)}
              className="w-full h-auto block photo-vintage cursor-pointer"
            />

            {isLoggedIn && (
              <>
                {movingKey === photo.key ? (
                  <div className="p-2 flex gap-1">
                    <input
                      type="text"
                      placeholder="移動先アルバム名"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="border border-accent-soft rounded-full px-3 py-1 text-sm flex-1 bg-paper"
                    />
                    <button
                      onClick={() => handleMove(photo.key)}
                      className="bg-accent text-paper-light text-sm px-3 rounded-full"
                    >
                      移動
                    </button>
                  </div>
                ) : (
                  <div className="flex">
                    <button
                      onClick={() => setMovingKey(photo.key)}
                      className="flex-1 text-sm p-2 text-sepia hover:bg-accent-soft rounded-bl-2xl"
                    >
                      別のアルバムに移動
                    </button>
                    <button
                      onClick={() => handleDelete(photo.key)}
                      className="text-sm p-2 text-red-700 hover:bg-red-50 rounded-br-2xl"
                    >
                      削除
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewPhoto.url}
              alt=""
              className="max-h-[75vh] w-auto rounded-2xl shadow-2xl photo-vintage"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleDownload(previewPhoto)}
                disabled={isDownloading}
                className="bg-accent text-paper-light font-heading text-sm rounded-full px-5 py-2 hover:opacity-90 transition disabled:opacity-40"
              >
                {isDownloading ? "ダウンロード中…" : "ダウンロード"}
              </button>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-sm text-paper-light border border-paper-light/50 rounded-full px-5 py-2 hover:bg-white/10"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}