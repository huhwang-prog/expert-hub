import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Institution } from "@/lib/types";

const KEY = "institutions";

export async function GET() {
  const list = await kvGet<Institution>(KEY);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const inst: Institution = await req.json();
  const list = await kvGet<Institution>(KEY);
  list.unshift(inst);
  await kvSet(KEY, list);
  return NextResponse.json(inst, { status: 201 });
}
