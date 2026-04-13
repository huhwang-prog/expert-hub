"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, User, Building2, Briefcase, GraduationCap, FileText, ClipboardList, Mail, Phone, Upload, X } from "lucide-react";
import { saveExpert } from "@/lib/storage";
import { Expert } from "@/lib/types";

const SPECIALTY_OPTIONS = [
  "경영/전략", "마케팅/홍보", "재무/회계", "인사/노무",
  "IT/소프트웨어", "데이터/AI", "법률/특허", "R&D/기술",
  "제조/생산", "유통/물류", "농업/식품", "문화/콘텐츠", "기타",
];

type FormData = {
  name: string; affiliation: string; position: string; specialty: string;
  education: string; career: string; evaluations: string; contact: string;
};

const EMPTY: FormData = {
  name: "", affiliation: "", position: "", specialty: "",
  education: "", career: "", evaluations: "", contact: "",
};

export default function ExpertPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [certFile, setCertFile] = useState<string | undefined>();
  const [certFileName, setCertFileName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("파일 크기는 5MB 이하여야 합니다."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setCertFile(reader.result as string);
      setCertFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    let summary = "", fields: string[] = [];
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, affiliation: form.affiliation,
          bio: `직위: ${form.position}\n전문분야: ${form.specialty}\n학력: ${form.education}\n경력: ${form.career}\n참여평가: ${form.evaluations}`,
        }),
      });
      const data = await res.json();
      if (res.ok) { summary = data.summary ?? ""; fields = data.fields ?? []; }
    } catch { /* AI 실패 시 빈값으로 진행 */ }

    saveExpert({ id: crypto.randomUUID(), ...form, certFile, certFileName, summary, fields, status: "pending", createdAt: new Date().toISOString() });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">신청 완료!</h2>
          <p className="text-gray-500 mb-6">관리자 승인 후 전문가 목록에 등록됩니다.</p>
          <button onClick={() => router.push("/")} className="text-sm text-blue-600 hover:underline">홈으로 돌아가기</button>
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
        <Field label="이름" icon={<User size={14} />} required>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="홍길동" className={inputCls} />
        </Field>
        <Field label="소속 기관" icon={<Building2 size={14} />} required>
          <input name="affiliation" value={form.affiliation} onChange={handleChange} required placeholder="OO대학교 / OO연구소 / OO기업" className={inputCls} />
        </Field>
        <Field label="직위 / 직책" icon={<Briefcase size={14} />} required>
          <input name="position" value={form.position} onChange={handleChange} required placeholder="교수 / 수석연구원 / 대표이사" className={inputCls} />
        </Field>
        <Field label="전문 분야" icon={<ClipboardList size={14} />} required>
          <select name="specialty" value={form.specialty} onChange={handleChange} required className={inputCls}>
            <option value="">선택하세요</option>
            {SPECIALTY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="최종 학력" icon={<GraduationCap size={14} />} required>
          <input name="education" value={form.education} onChange={handleChange} required placeholder="OO대학교 OO학과 박사/석사/학사" className={inputCls} />
        </Field>
        <Field label="주요 경력" icon={<FileText size={14} />} required>
          <textarea name="career" value={form.career} onChange={handleChange} required rows={4}
            placeholder={"2020~현재  OO기업 수석연구원\n2015~2020  OO대학교 조교수"} className={`${inputCls} resize-none`} />
        </Field>

        {/* 참여 평가 이력 + 증빙 첨부 */}
        <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">평가위원 이력 (선택)</p>
          <Field label="참여 평가 이력" icon={<ClipboardList size={14} />}>
            <textarea name="evaluations" value={form.evaluations} onChange={handleChange} rows={3}
              placeholder={"2024  중소벤처기업부 기술평가위원\n2023  산업통상자원부 R&D 심사위원"} className={`${inputCls} resize-none`} />
          </Field>
          <Field label="위촉 증빙 서류" icon={<Upload size={14} />}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} className="hidden" />
            {certFileName ? (
              <div className="flex items-center gap-3 border border-blue-200 bg-blue-50 rounded-xl px-4 py-3">
                <FileText size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-700 flex-1 truncate">{certFileName}</span>
                <button type="button" onClick={() => { setCertFile(undefined); setCertFileName(undefined); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                <Upload size={15} />PDF 또는 이미지 파일 첨부 (최대 5MB)
              </button>
            )}
            <p className="text-xs text-gray-400 mt-1">위촉장, 참여 확인서 등 증빙 서류를 첨부하면 신뢰도가 높아집니다.</p>
          </Field>
        </div>

        <Field label="연락처 (이메일)" icon={<Mail size={14} />} required>
          <input name="contact" type="email" value={form.contact} onChange={handleChange} required placeholder="example@email.com" className={inputCls} />
        </Field>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {submitting ? <><Loader2 size={18} className="animate-spin" />AI 분석 중... 잠시만 기다려주세요</> : "등록 신청하기"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white";

function Field({ label, icon, required, children }: { label: string; icon: React.ReactNode; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <span className="inline-flex items-center gap-1.5">{icon}{label}{required && <span className="text-red-500">*</span>}</span>
      </label>
      {children}
    </div>
  );
}
