import { cleanupExpiredFiles } from "@/lib/cleanup";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Optional security
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await cleanupExpiredFiles();

  return NextResponse.json({
    deleted: count,
  });
}
