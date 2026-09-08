import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { key, album } = await req.json();
  const bucket = process.env.S3_BUCKET_NAME!;

  if (key) {
    // 写真1枚だけ削除
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ success: true });
  }

  if (album) {
    // アルバムごと削除(中の写真を全部リストして一括削除)
    const listed = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: `${album}/` })
    );

    const objects = (listed.Contents ?? [])
      .filter((item) => item.Key)
      .map((item) => ({ Key: item.Key! }));

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects },
        })
      );
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "keyまたはalbumが必要です" }, { status: 400 });
}