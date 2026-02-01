import { NextResponse } from "next/server";
import { cleanupExpiredFiles } from "@/lib/cleanup";

export async function GET(req: Request) {
  // Optional security
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  const hasValidAuth = auth === `Bearer ${expectedSecret}`;
  const hasValidQuery = querySecret && querySecret === expectedSecret;

  if (!isVercelCron && !hasValidAuth && !hasValidQuery) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await cleanupExpiredFiles();

  return NextResponse.json({
    deleted: count,
  });
}
