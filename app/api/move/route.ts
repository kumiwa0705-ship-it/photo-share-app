import { NextRequest, NextResponse } from "next/server";
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getS3Client() {
  return new S3Client({
    region: process.env.APP_AWS_REGION,
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  const s3 = getS3Client();
  const { sourceKey, destinationAlbum } = await req.json();

  const bucket = process.env.S3_BUCKET_NAME!;
  const filename = sourceKey.split("/").pop();
  const destinationKey = `${destinationAlbum.trim()}/${filename}`;

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${encodeURIComponent(sourceKey)}`,
      Key: destinationKey,
    })
  );

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: sourceKey,
    })
  );

  return NextResponse.json({ success: true, newKey: destinationKey });
}