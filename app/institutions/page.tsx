"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Building2, Tag, FolderOpen, Users, ExternalLink, X, Send, CheckCircle } from "lucide-react";
import { getApprovedInstitutions, saveApplication } from "@/lib/storage";
import { Institution, Project, Application } from "@/lib/types";

type ApplyTarget = { inst: Institution; project: Project };

export default function InstitutionsPage() {
  const [query, setQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [applyTarget, setApplyTarget] = useState<ApplyTarget | null>(null);
  const [applyDone, setApplyDone] = useState(false);

  useEffect(() => {
    getApprovedInstitutions().then(setInstitutions);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return institutions;
    return institutions.filter((i) =>
      i.orgName.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.expertField?.toLowerCase().includes(q) ||
      i.projects.some((p) =>
        p.title.toLowerCase().includes(q) ||
        p.specialties.some((s) => s.toLowerCase().includes(q))
      )
    );
  }, [query, institutions]);

  const totalProjects = filtered.reduce((sum, i) => sum + i.projects.length, 0);
  const totalNeeded = filtered.reduce((sum, i) => sum + i.projects.reduce((s, p) => s + p.requiredCount, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">기관 수요 현황</h1>
        <p className="text-gray-500">전문가를 필요로 하는 기관과 프로젝트를 확인하고 신청해보세요.</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "참여 기관", value: filtered.length },
          { label: "진행 프로젝트", value: totalProjects },
          { label: "필요 전문가", value: `${totalNeeded}명` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <div className="text-2xl font-bold text-blue-700">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="기관명, 프로젝트명, 필요 분야로 검색..."
          className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((inst) => (
            <div key={inst.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* 기관 헤더 */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="font-bold text-gray-900 text-lg">{inst.orgName}</h2>
                      {inst.expertField && (
                        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
                          {inst.expertField} 전문가 필요
                        </span>
                      )}
                    </div>
                    {inst.description && (
                      <p className="text-sm text-gray-500 leading-relaxed">{inst.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        프로젝트 {inst.projects.length}개 · 총 {inst.projects.reduce((s, p) => s + p.requiredCount, 0)}명 필요
                      </span>
                      {inst.referenceLink && (
                        <a href={inst.referenceLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                          <ExternalLink size={11} />홈페이지 바로가기
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 프로젝트 목록 */}
              {inst.projects.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {inst.projects.map((p) => (
                    <div key={p.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <FolderOpen size={15} className="text-blue-500 flex-shrink-0" />{p.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {p.period && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                📅 {p.period}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs bg-blue-600 text-white font-semibold px-2.5 py-1 rounded-full">
                              <Users size={11} />{p.requiredCount}명 모집
                            </span>
                            {p.specialties.map((s) => (
                              <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                <Tag size={9} />{s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => { setApplyTarget({ inst, project: p }); setApplyDone(false); }}
                          className="flex-shrink-0 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                          <Send size={12} />신청하기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-5 text-sm text-gray-400">등록된 프로젝트가 없습니다.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 신청 모달 */}
      {applyTarget && (
        <ApplyModal
          inst={applyTarget.inst}
          project={applyTarget.project}
          done={applyDone}
          onDone={() => setApplyDone(true)}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </div>
  );
}

function ApplyModal({ inst, project, done, onDone, onClose }: {
  inst: Institution; project: Project; done: boolean; onDone: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ expertName: "", expertContact: "", expertPhone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const app: Application = {
      id: crypto.randomUUID(),
      ...form,
      institutionId: inst.id,
      institutionName: inst.orgName,
      projectId: project.id,
      projectTitle: project.title,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await saveApplication(app);
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">신청 완료!</h3>
            <p className="text-gray-500 text-sm mb-1"><strong>{inst.orgName}</strong></p>
            <p className="text-gray-400 text-sm mb-6">{project.title}</p>
            <p className="text-gray-500 text-sm">기관 담당자 검토 후 연락드립니다.</p>
            <button onClick={onClose} className="mt-6 text-sm text-blue-600 hover:underline">닫기</button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">전문가 신청</h3>
              <p className="text-sm text-gray-500">{inst.orgName} · {project.title}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">이름 <span className="text-red-500">*</span></label>
                <input required value={form.expertName} onChange={(e) => setForm((p) => ({ ...p, expertName: e.target.value }))}
                  placeholder="홍길동" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">이메일 <span className="text-red-500">*</span></label>
                  <input required type="email" value={form.expertContact} onChange={(e) => setForm((p) => ({ ...p, expertContact: e.target.value }))}
                    placeholder="example@email.com" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">전화번호 <span className="text-red-500">*</span></label>
                  <input required type="tel" value={form.expertPhone} onChange={(e) => setForm((p) => ({ ...p, expertPhone: e.target.value }))}
                    placeholder="010-0000-0000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">한 줄 소개 <span className="text-gray-400 font-normal">(선택)</span></label>
                <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  rows={2} placeholder="전문성을 간략히 소개해주세요." className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2">
                <Send size={15} />{submitting ? "신청 중..." : "신청하기"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
