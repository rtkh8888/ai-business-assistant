import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

export async function GET() {
  const envStatus = getEnvStatus();

  return NextResponse.json({
    ok: true,
    env: envStatus.ok ? "configured" : "missing",
    message: envStatus.message,
  });
}
