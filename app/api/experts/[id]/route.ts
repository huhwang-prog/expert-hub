import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Expert } from "@/lib/types";

const KEY = "experts";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const experts = await kvGet<Expert>(KEY);
  const updated = experts.map((e) => e.id === id ? { ...e, ...body } : e);
  await kvSet(KEY, updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experts = await kvGet<Expert>(KEY);
  await kvSet(KEY, experts.filter((e) => e.id !== id));
  return NextResponse.json({ ok: true });
}
