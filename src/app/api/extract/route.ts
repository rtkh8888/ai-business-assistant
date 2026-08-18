import { NextResponse } from "next/server";
import { z } from "zod";
import { extractWebsite } from "@/lib/extract";

const bodySchema = z.object({
  website_url: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body. Expected { website_url }." },
      { status: 400 },
    );
  }

  try {
    const extraction = await extractWebsite(parsed.data.website_url);
    return NextResponse.json({ ok: true, extraction });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Extraction failed.",
      },
      { status: 500 },
    );
  }
}
