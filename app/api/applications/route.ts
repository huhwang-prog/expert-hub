import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Application } from "@/lib/types";

const KEY = "applications";

export async function GET() {
  const list = await kvGet<Application>(KEY);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const app: Application = await req.json();
  const list = await kvGet<Application>(KEY);
  list.unshift(app);
  await kvSet(KEY, list);
  return NextResponse.json(app, { status: 201 });
}
