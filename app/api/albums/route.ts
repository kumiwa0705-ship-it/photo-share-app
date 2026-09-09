import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

function getS3Client() {
  return new S3Client({
    region: process.env.APP_AWS_REGION,
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function GET() {
  const s3 = getS3Client();
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Delimiter: "/",
    })
  );

  const albums = (result.CommonPrefixes ?? [])
    .map((p) => p.Prefix!.replace(/\/$/, ""))
    .filter((name) => name !== "thumbnails")
    .sort();

  return NextResponse.json({ albums });
}