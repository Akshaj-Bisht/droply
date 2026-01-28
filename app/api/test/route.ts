import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const files = await prisma.file.count();
  return NextResponse.json(files);
}
