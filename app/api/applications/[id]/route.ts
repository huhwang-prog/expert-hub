import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { Application } from "@/lib/types";

const KEY = "applications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const list = await kvGet<Application>(KEY);
  await kvSet(KEY, list.map((a) => a.id === id ? { ...a, ...body } : a));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await kvGet<Application>(KEY);
  await kvSet(KEY, list.filter((a) => a.id !== id));
  return NextResponse.json({ ok: true });
}
