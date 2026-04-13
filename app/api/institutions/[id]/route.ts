import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Institution } from "@/lib/types";

const KEY = "institutions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const list = await kvGet<Institution>(KEY);
  const updated = list.map((i) => i.id === id ? { ...i, ...body } : i);
  await kvSet(KEY, updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await kvGet<Institution>(KEY);
  await kvSet(KEY, list.filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
