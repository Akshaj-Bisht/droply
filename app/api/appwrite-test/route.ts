import { storage } from "@/lib/appwrite";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await storage.listBuckets();
  return NextResponse.json(res);
}
