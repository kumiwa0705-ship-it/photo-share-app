import Link from "next/link";
import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import Header from "./Header";

function getS3Client() {
  return new S3Client({
    region: process.env.APP_AWS_REGION,
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function urlFor(key: string) {
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.APP_AWS_REGION}.amazonaws.com/${key}`;
}

async function getAlbumNames() {
  const s3 = getS3Client();
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Delimiter: "/",
    })
  );
  return (result.CommonPrefixes ?? [])
    .map((p) => p.Prefix!.replace(/\/$/, ""))
    .filter((name) => name !== "thumbnails")
    .sort();
}

async function thumbnailExists(key: string) {
  const s3 = getS3Client();
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `thumbnails/${key}`,
      })
    );
    return true;
  } catch {
    return false;
  }
}

async function getCoverPhoto(album: string) {
  const s3 = getS3Client();
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `${album}/`,
    })
  );
  const first = (result.Contents ?? []).find(
    (item) => item.Key && !item.Key.endsWith("/")
  );
  if (!first?.Key) return null;

  const hasThumbnail = await thumbnailExists(first.Key);
  return urlFor(hasThumbnail ? `thumbnails/${first.Key}` : first.Key);
}

async function getPhotoCount(album: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_COUNT_API_URL}?album=${encodeURIComponent(album)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data.count as number;
  } catch {
    return null;
  }
}

export default async function Home() {
  const names = await getAlbumNames();
  const albums = await Promise.all(
    names.map(async (name) => ({
      name,
      cover: await getCoverPhoto(name),
      count: await getPhotoCount(name),
    }))
  );

  return (
    <main className="min-h-screen p-8 md:p-12">
      <Header />

      {albums.length === 0 ? (
        <p className="text-sepia">まだアルバムがありません。</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link
              key={album.name}
              href={`/albums/${encodeURIComponent(album.name)}`}
              className="group block rounded-3xl bg-paper-light border border-accent-soft shadow-[0_6px_16px_rgba(74,55,40,0.15)] overflow-hidden transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="aspect-square bg-accent-soft overflow-hidden">
                {album.cover ? (
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-full h-full object-cover photo-vintage"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📷
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-accent-soft flex justify-between items-center">
                <p className="font-heading text-ink truncate">{album.name}</p>
                {album.count !== null && (
                  <span className="text-xs text-sepia shrink-0 ml-2">
                    {album.count}枚
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}