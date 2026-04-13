import { NextRequest, NextResponse } from "next/server";
import { kvGet } from "@/lib/kv";
import { Institution } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const list = await kvGet<Institution>("institutions");
  const found = list.find((i) => i.email === email && i.password === password);
  if (!found) return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  // 비밀번호는 응답에서 제외
  const { password: _pw, ...safe } = found;
  return NextResponse.json(safe);
}
