import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Expert } from "@/lib/types";

const KEY = "experts";

export async function GET() {
  const experts = await kvGet<Expert>(KEY);
  return NextResponse.json(experts);
}

export async function POST(req: NextRequest) {
  const expert: Expert = await req.json();
  const experts = await kvGet<Expert>(KEY);
  experts.unshift(expert);
  await kvSet(KEY, experts);
  return NextResponse.json(expert, { status: 201 });
}
