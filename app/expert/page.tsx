"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, User, Building2, Briefcase, GraduationCap, FileText, ClipboardList, Mail, Phone, Upload, X, Plus, Trash2 } from "lucide-react";
import { saveExpert } from "@/lib/storage";
import { Expert, CareerItem } from "@/lib/types";

const SPECIALTY_OPTIONS = [
  "경영/전략", "마케팅/홍보", "재무/회계", "인사/노무",
  "IT/소프트웨어", "데이터/AI", "법률/특허", "R&D/기술",
  "제조/생산", "유통/물류", "농업/식품", "문화/콘텐츠", "기타",
];

export default function ExpertPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", affiliation: "", position: "", specialty: "", education: "", evaluations: "", phone: "", contact: "" });
  const [careers, setCareers] = useState<CareerItem[]>([{ period: "", org: "", role: "" }]);
  const [certFile, setCertFile] = useState<string | undefined>();
  const [certFileName, setCertFileName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCareer = (idx: number, field: keyof CareerItem, value: string) => {
    setCareers((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const addCareer = () => setCareers((prev) => [...prev, { period: "", org: "", role: "" }]);
  const removeCareer = (idx: number) => setCareers((prev) => prev.filter((_, i) => i !== idx));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("파일 크기는 2MB 이하여야 합니다."); return; }
    const reader = new FileReader();
    reader.onload = () => { setCertFile(reader.result as string); setCertFileName(file.name); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filledCareers = careers.filter((c) => c.period || c.org || c.role);
    if (filledCareers.length === 0) { alert("주요 경력을 1개 이상 입력해주세요."); return; }
    setSubmitting(true);

    const careerText = filledCareers.map((c) => `${c.period}  ${c.org}  ${c.role}`).join("\n");
    let summary = "", fields: string[] = [];
    try {
      const res = await fetch("/api/summarize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, affiliation: form.affiliation,
          bio: `직위: ${form.position}\n전문분야: ${form.specialty}\n학력: ${form.education}\n경력:\n${careerText}\n참여평가: ${form.evaluations}` }),
      });
      const data = await res.json();
      if (res.ok) { summary = data.summary ?? ""; fields = data.fields ?? []; }
    } catch { /* AI 실패 시 진행 */ }

    const expert: Expert = { id: crypto.randomUUID(), ...form, careers: filledCareers, certFile, certFileName, summary, fields, status: "pending", createdAt: new Date().toISOString() };
    await saveExpert(expert);
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
        {/* 기본 정보 */}
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

        {/* 연락처 */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="이메일" icon={<Mail size={14} />} required>
            <input name="contact" type="email" value={form.contact} onChange={handleChange} required placeholder="example@email.com" className={inputCls} />
          </Field>
          <Field label="전화번호" icon={<Phone size={14} />} required>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="010-0000-0000" className={inputCls} />
          </Field>
        </div>

        {/* 주요 경력 — 구조화 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <span className="inline-flex items-center gap-1.5"><FileText size={14} />주요 경력 <span className="text-red-500">*</span></span>
          </label>
          <div className="space-y-2">
            {careers.map((c, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input value={c.period} onChange={(e) => handleCareer(idx, "period", e.target.value)}
                  placeholder="기간 (예: 2020~현재)" className={`${inputCls} w-36 flex-shrink-0`} />
                <input value={c.org} onChange={(e) => handleCareer(idx, "org", e.target.value)}
                  placeholder="소속" className={`${inputCls} flex-1`} />
                <input value={c.role} onChange={(e) => handleCareer(idx, "role", e.target.value)}
                  placeholder="주요 업무" className={`${inputCls} flex-1`} />
                {careers.length > 1 && (
                  <button type="button" onClick={() => removeCareer(idx)} className="p-2.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addCareer}
            className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
            <Plus size={14} />경력 추가
          </button>
        </div>

        {/* 평가위원 이력 + 증빙 */}
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
                  className="text-gray-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                <Upload size={15} />PDF 또는 이미지 첨부 (최대 2MB)
              </button>
            )}
          </Field>
        </div>

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
