"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle, AlertCircle, User, Building2, FileText } from "lucide-react";
import { saveExpert } from "@/lib/storage";
import { Expert } from "@/lib/types";

interface AISummary {
  summary: string;
  fields: string[];
}

export default function ExpertPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", affiliation: "", bio: "" });
  const [aiResult, setAiResult] = useState<AISummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setAiResult(null);
    setAiError("");
  };

  const handleSummarize = async () => {
    if (!form.bio.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "요약 실패");
      setAiResult(data);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.affiliation || !form.bio) return;
    setSubmitting(true);

    const expert: Expert = {
      id: crypto.randomUUID(),
      name: form.name,
      affiliation: form.affiliation,
      bio: form.bio,
      summary: aiResult?.summary || "",
      fields: aiResult?.fields || [],
      createdAt: new Date().toISOString(),
    };
    saveExpert(expert);
    setDone(true);
    setTimeout(() => router.push("/search"), 1500);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">등록 완료!</h2>
          <p className="text-gray-500">전문가 검색 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 이력 등록</h1>
        <p className="text-gray-500">이력을 작성하면 AI가 핵심 전문 분야를 자동으로 요약합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User size={14} className="inline mr-1.5" />이름 *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="홍길동"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
          />
        </div>

        {/* 소속 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Building2 size={14} className="inline mr-1.5" />소속 기관 *
          </label>
          <input
            name="affiliation"
            value={form.affiliation}
            onChange={handleChange}
            required
            placeholder="OO대학교 / OO연구소 / OO기업"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
          />
        </div>

        {/* 상세 이력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FileText size={14} className="inline mr-1.5" />상세 이력 *
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            required
            rows={7}
            placeholder="전문 분야, 주요 경력, 연구 실적, 보유 역량 등을 자유롭게 작성해주세요."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={!form.bio.trim() || aiLoading}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {aiLoading ? (
                <><Loader2 size={14} className="animate-spin" />AI 분석 중...</>
              ) : (
                <><Sparkles size={14} />AI 핵심 분야 요약하기</>
              )}
            </button>
          </div>
        </div>

        {/* AI 결과 */}
        {aiError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {aiError}
          </div>
        )}

        {aiResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
              <Sparkles size={15} />
              AI 요약 결과
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{aiResult.summary}</p>
            {aiResult.fields.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {aiResult.fields.map((f) => (
                  <span
                    key={f}
                    className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 제출 */}
        <button
          type="submit"
          disabled={submitting || !form.name || !form.affiliation || !form.bio}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base"
        >
          {submitting ? "등록 중..." : "이력 등록하기"}
        </button>
      </form>
    </div>
  );
}
