import { Client, Storage } from "node-appwrite";
export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY || "");

export const storage = new Storage(client);
