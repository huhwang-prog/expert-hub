import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { name, affiliation, bio } = await req.json();

  if (!bio || bio.trim().length < 10) {
    return NextResponse.json({ error: "이력 내용이 너무 짧습니다." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful fallback when API key is not set
    return NextResponse.json({
      summary: "AI 요약을 사용하려면 ANTHROPIC_API_KEY 환경 변수를 설정하세요.",
      fields: ["설정 필요"],
    });
  }

  const prompt = `다음 전문가의 이력을 분석해 핵심 전문 분야와 역량을 한국어로 요약해주세요.

이름: ${name}
소속: ${affiliation}
이력/경력 내용:
${bio}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "summary": "2~3문장으로 핵심 전문성과 경력을 요약한 문장",
  "fields": ["핵심분야1", "핵심분야2", "핵심분야3"]
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AI 응답 파싱 실패" }, { status: 500 });
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return NextResponse.json(parsed);
}
