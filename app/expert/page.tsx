"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, User, Building2, Briefcase, GraduationCap, FileText, ClipboardList, Mail } from "lucide-react";
import { saveExpert } from "@/lib/storage";
import { Expert } from "@/lib/types";

const SPECIALTY_OPTIONS = [
  "경영/전략", "마케팅/홍보", "재무/회계", "인사/노무",
  "IT/소프트웨어", "데이터/AI", "법률/특허", "R&D/기술",
  "제조/생산", "유통/물류", "농업/식품", "문화/콘텐츠", "기타",
];

type FormData = {
  name: string;
  affiliation: string;
  position: string;
  specialty: string;
  education: string;
  career: string;
  evaluations: string;
  contact: string;
};

const EMPTY: FormData = {
  name: "", affiliation: "", position: "", specialty: "",
  education: "", career: "", evaluations: "", contact: "",
};

export default function ExpertPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    // AI 요약 자동 호출
    let summary = "";
    let fields: string[] = [];
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          affiliation: form.affiliation,
          bio: `직위: ${form.position}\n전문분야: ${form.specialty}\n학력: ${form.education}\n경력: ${form.career}\n참여평가: ${form.evaluations}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        summary = data.summary ?? "";
        fields = data.fields ?? [];
      }
    } catch {
      // AI 요약 실패해도 신청은 진행
    }

    const expert: Expert = {
      id: crypto.randomUUID(),
      ...form,
      summary,
      fields,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveExpert(expert);
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">신청 완료!</h2>
          <p className="text-gray-500 mb-6">관리자 승인 후 전문가 목록에 등록됩니다.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 등록 신청</h1>
        <p className="text-gray-500">제출하면 AI가 자동으로 핵심 분야를 요약하며, 관리자 승인 후 게재됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* 이름 */}
        <Field label="이름" icon={<User size={14} />} required>
          <input name="name" value={form.name} onChange={handleChange} required
            placeholder="홍길동"
            className={inputCls} />
        </Field>

        {/* 소속 기관 */}
        <Field label="소속 기관" icon={<Building2 size={14} />} required>
          <input name="affiliation" value={form.affiliation} onChange={handleChange} required
            placeholder="OO대학교 / OO연구소 / OO기업"
            className={inputCls} />
        </Field>

        {/* 직위/직책 */}
        <Field label="직위 / 직책" icon={<Briefcase size={14} />} required>
          <input name="position" value={form.position} onChange={handleChange} required
            placeholder="교수 / 수석연구원 / 대표이사"
            className={inputCls} />
        </Field>

        {/* 전문 분야 */}
        <Field label="전문 분야" icon={<ClipboardList size={14} />} required>
          <select name="specialty" value={form.specialty} onChange={handleChange} required
            className={inputCls}>
            <option value="">선택하세요</option>
            {SPECIALTY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>

        {/* 최종 학력 */}
        <Field label="최종 학력" icon={<GraduationCap size={14} />} required>
          <input name="education" value={form.education} onChange={handleChange} required
            placeholder="OO대학교 OO학과 박사/석사/학사"
            className={inputCls} />
        </Field>

        {/* 주요 경력 */}
        <Field label="주요 경력" icon={<FileText size={14} />} required>
          <textarea name="career" value={form.career} onChange={handleChange} required rows={4}
            placeholder={"2020~현재  OO기업 연구소 수석연구원\n2015~2020  OO대학교 조교수\n2010~2015  OO연구원 선임연구원"}
            className={`${inputCls} resize-none`} />
        </Field>

        {/* 참여 평가 이력 */}
        <Field label="참여 평가 이력" icon={<ClipboardList size={14} />}>
          <textarea name="evaluations" value={form.evaluations} onChange={handleChange} rows={3}
            placeholder={"2024  중소벤처기업부 기술평가위원\n2023  산업통상자원부 R&D 심사위원\n2022  창업진흥원 사업화 평가위원"}
            className={`${inputCls} resize-none`} />
          <p className="text-xs text-gray-400 mt-1">없으면 비워두세요.</p>
        </Field>

        {/* 이메일 */}
        <Field label="연락처 (이메일)" icon={<Mail size={14} />} required>
          <input name="contact" type="email" value={form.contact} onChange={handleChange} required
            placeholder="example@email.com"
            className={inputCls} />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-base flex items-center justify-center gap-2 mt-2"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" />AI 요약 중... 잠시만 기다려주세요</>
          ) : "등록 신청하기"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white";

function Field({ label, icon, required, children }: {
  label: string; icon: React.ReactNode; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <span className="inline-flex items-center gap-1.5">
          {icon}{label}{required && <span className="text-red-500">*</span>}
        </span>
      </label>
      {children}
    </div>
  );
}
