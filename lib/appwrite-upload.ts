import { storage } from "./appwrite";
import { ID } from "appwrite";

export async function uploadToAppwrite(file: File) {
  const res = await storage.createFile({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId: ID.unique(),
    file,
  });

  return res.$id;
}
