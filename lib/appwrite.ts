import { Client, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PPWRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY!);

export const storage = new Storage(client);
