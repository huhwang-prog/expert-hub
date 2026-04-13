"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, User, ClipboardList, FileText, Mail, Phone, Link, Tag, X, Plus } from "lucide-react";
import { saveExpert } from "@/lib/storage";
import { Expert } from "@/lib/types";
import { EXPERT_FIELDS, COLLABORATION_TYPES } from "@/lib/constants";

export default function ExpertPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    expertise: "",
    mainField: "",
    careerSummary: "",
    portfolioLink: "",
    contact: "",
    phone: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [collaborationTypes, setCollaborationTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  const toggleCollab = (type: string) => {
    setCollaborationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.mainField) { alert("메인 전문 분야를 선택해주세요."); return; }
    if (collaborationTypes.length === 0) { alert("희망 협업 형태를 1개 이상 선택해주세요."); return; }
    setSubmitting(true);

    let summary = "", fields: string[] = [];
    try {
      const res = await fetch("/api/summarize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          affiliation: form.mainField,
          bio: `한 줄 소개: ${form.tagline}\n전문성: ${form.expertise}\n경력 요약: ${form.careerSummary}\n스킬: ${skills.join(", ")}`,
        }),
      });
      const data = await res.json();
      if (res.ok) { summary = data.summary ?? ""; fields = data.fields ?? []; }
    } catch { /* AI 실패 시 진행 */ }

    const expert: Expert = {
      id: crypto.randomUUID(),
      ...form,
      skills,
      collaborationTypes,
      summary,
      fields,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
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

        <Field label="나를 나타내는 한 줄 소개" icon={<User size={14} />} required>
          <input name="tagline" value={form.tagline} onChange={handleChange} required
            placeholder="예: 스타트업 투자·사업화 10년 경력의 현장형 전문가" className={inputCls} />
        </Field>

        <Field label="메인 전문 분야" icon={<ClipboardList size={14} />} required>
          <select name="mainField" value={form.mainField} onChange={handleChange} required className={inputCls}>
            <option value="">선택하세요</option>
            {EXPERT_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>

        <Field label="전문성 및 이력" icon={<FileText size={14} />} required>
          <textarea name="expertise" value={form.expertise} onChange={handleChange} required rows={4}
            placeholder="어떤 분야에서 어떤 전문성을 쌓아왔는지 자유롭게 작성해주세요." className={`${inputCls} resize-none`} />
        </Field>

        {/* 핵심 보유 스킬 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="inline-flex items-center gap-1.5"><Tag size={14} />핵심 보유 스킬</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
              placeholder="예: 사업 고도화 (Enter로 추가)" className={`${inputCls} flex-1`} />
            <button type="button" onClick={addSkill}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0">
              <Plus size={14} />
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-700"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Field label="주요 경력 요약" icon={<FileText size={14} />} required>
          <textarea name="careerSummary" value={form.careerSummary} onChange={handleChange} required rows={3}
            placeholder="어디서 어떤 일을 했는지 핵심만 2~3줄로 요약해주세요." className={`${inputCls} resize-none`} />
        </Field>

        <Field label="포트폴리오 / 이력서 / 링크드인" icon={<Link size={14} />} required>
          <input name="portfolioLink" value={form.portfolioLink} onChange={handleChange} required
            type="url" placeholder="https://linkedin.com/in/..." className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">전문성을 증명할 핵심 링크를 입력해주세요.</p>
        </Field>

        {/* 연락 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="연락받을 이메일" icon={<Mail size={14} />} required>
            <input name="contact" type="email" value={form.contact} onChange={handleChange} required placeholder="example@email.com" className={inputCls} />
          </Field>
          <Field label="연락받을 전화번호" icon={<Phone size={14} />} required>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="010-0000-0000" className={inputCls} />
          </Field>
        </div>

        {/* 희망 협업 형태 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <span className="inline-flex items-center gap-1.5"><ClipboardList size={14} />희망 협업 형태 <span className="text-red-500">*</span></span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COLLABORATION_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => toggleCollab(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${collaborationTypes.includes(type) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                {type}
              </button>
            ))}
          </div>
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
