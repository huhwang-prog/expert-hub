import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Match } from "@/lib/types";

const KEY = "matches";

export async function GET() {
  const list = await kvGet<Match>(KEY);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const match: Match = await req.json();
  const list = await kvGet<Match>(KEY);
  list.unshift(match);
  await kvSet(KEY, list);
  return NextResponse.json(match, { status: 201 });
}
