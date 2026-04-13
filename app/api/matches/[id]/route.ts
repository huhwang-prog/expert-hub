import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Match } from "@/lib/types";

const KEY = "matches";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const list = await kvGet<Match>(KEY);
  await kvSet(KEY, list.map((m) => m.id === id ? { ...m, ...body } : m));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await kvGet<Match>(KEY);
  await kvSet(KEY, list.filter((m) => m.id !== id));
  return NextResponse.json({ ok: true });
}
