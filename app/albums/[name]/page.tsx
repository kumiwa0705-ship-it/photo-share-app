import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import PhotoGrid from "./PhotoGrid";
import DeleteAlbumButton from "./DeleteAlbumButton";

export const dynamic = "force-dynamic";

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

async function thumbnailExists(s3: S3Client, key: string) {
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

async function getPhotos(album: string) {
  const s3 = getS3Client();
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `${album}/`,
    })
  );

  const rawItems = (result.Contents ?? []).filter(
    (item) => item.Key && !item.Key.endsWith("/")
  );

  return Promise.all(
    rawItems.map(async (item) => {
      const key = item.Key!;
      const hasThumbnail = await thumbnailExists(s3, key);
      return {
        key,
        thumbnailUrl: urlFor(hasThumbnail ? `thumbnails/${key}` : key),
        fullUrl: urlFor(key),
      };
    })
  ).then((items) => items.sort((a, b) => (a.key < b.key ? 1 : -1)));
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const album = decodeURIComponent(name);
  const photos = await getPhotos(album);

  return (
    <main className="min-h-screen p-8 md:p-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl text-ink">📁 {album}</h1>
        <DeleteAlbumButton album={album} />
      </div>
      <PhotoGrid photos ={photos} />
    </main>
  );
}