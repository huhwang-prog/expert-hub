"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, LogOut, FolderOpen, Users, Tag, X, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getAllInstitutions, updateInstitution, getAllMatches } from "@/lib/storage";
import { Institution, Project, Match } from "@/lib/types";
import { EXPERT_FIELDS } from "@/lib/constants";

const EMPTY_PROJECT = { title: "", period: "", specialties: [] as string[], requiredCount: 1 };

export default function InstitutionDashboard() {
  const router = useRouter();
  const [inst, setInst] = useState<Institution | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tab, setTab] = useState<"projects" | "matches">("projects");
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ ...EMPTY_PROJECT });

  useEffect(() => {
    const id = sessionStorage.getItem("inst_id");
    if (!id) { router.push("/institution"); return; }
    Promise.all([getAllInstitutions(), getAllMatches()]).then(([insts, allMatches]) => {
      const found = insts.find((i) => i.id === id);
      if (!found) { router.push("/institution"); return; }
      setInst(found);
      setMatches(allMatches.filter((m) => m.institutionId === id));
    });
  }, [router]);

  if (!inst) return null;

  const statusBadge = { pending: "승인 대기 중", approved: "승인됨", rejected: "가입 거절됨" };
  const statusColor = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", approved: "bg-green-50 text-green-700 border-green-200", rejected: "bg-red-50 text-red-600 border-red-200" };

  const addProject = async () => {
    if (!newProject.title) { alert("프로젝트명을 입력해주세요."); return; }
    if (newProject.specialties.length === 0) { alert("필요 분야를 1개 이상 선택해주세요."); return; }
    const project: Project = { id: crypto.randomUUID(), ...newProject };
    const updated = { ...inst, projects: [...inst.projects, project] };
    await updateInstitution(updated);
    setInst(updated);
    setNewProject({ ...EMPTY_PROJECT });
    setShowForm(false);
  };

  const removeProject = async (id: string) => {
    if (!confirm("이 프로젝트를 삭제할까요?")) return;
    const updated = { ...inst, projects: inst.projects.filter((p) => p.id !== id) };
    await updateInstitution(updated);
    setInst(updated);
  };

  const toggleSpecialty = (sp: string) => {
    setNewProject((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(sp)
        ? prev.specialties.filter((s) => s !== sp)
        : [...prev.specialties, sp],
    }));
  };

  const matchStatusIcon = { suggested: <Clock size={14} className="text-yellow-500" />, confirmed: <CheckCircle2 size={14} className="text-green-500" />, cancelled: <XCircle size={14} className="text-red-400" /> };
  const matchStatusLabel = { suggested: "검토 중", confirmed: "매칭 확정", cancelled: "취소됨" };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{inst.orgName}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[inst.status]}`}>{statusBadge[inst.status]}</span>
          </div>
          <p className="text-gray-500 text-sm">담당자: {inst.adminName} · {inst.email}</p>
        </div>
        <button onClick={() => { sessionStorage.removeItem("inst_id"); router.push("/institution"); }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <LogOut size={14} />로그아웃
        </button>
      </div>

      {inst.status !== "approved" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 mb-8">
          관리자 승인 대기 중입니다. 승인 후 프로젝트 정보가 외부에 공개됩니다.
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-8">
        {([["projects", <FolderOpen size={15} key="f" />, `프로젝트 관리 (${inst.projects.length})`], ["matches", <Users size={15} key="u" />, `매칭 현황 (${matches.length})`]] as const).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {tab === "projects" && (
        <div className="space-y-4">
          {inst.projects.length === 0 && !showForm && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
              <FolderOpen size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-1">등록된 프로젝트가 없습니다.</p>
              <p className="text-xs">아래 버튼으로 필요한 전문가 정보를 등록해보세요.</p>
            </div>
          )}

          {inst.projects.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <button onClick={() => removeProject(p.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={15} /></button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {p.period && <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">📅 {p.period}</span>}
                <span className="text-xs text-blue-600 bg-blue-50 font-semibold px-2.5 py-1 rounded-full">👥 {p.requiredCount}명 필요</span>
                {p.specialties.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"><Tag size={9} />{s}</span>
                ))}
              </div>
            </div>
          ))}

          {showForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-5">
              <p className="font-bold text-gray-800">새 프로젝트 등록</p>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">프로젝트명 / 평가명 <span className="text-red-500">*</span></label>
                <input value={newProject.title}
                  onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 2026년 초기창업패키지 서면평가" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">필요 기간</label>
                <input value={newProject.period}
                  onChange={(e) => setNewProject((p) => ({ ...p, period: e.target.value }))}
                  placeholder="예: 2026.05 ~ 2026.06" className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">총 필요 인원 <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                  <input type="number" min={1} max={100} value={newProject.requiredCount}
                    onChange={(e) => setNewProject((p) => ({ ...p, requiredCount: Number(e.target.value) }))}
                    className={`${inputCls} w-28`} />
                  <span className="text-sm text-gray-500">명</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">필요 분야 <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {EXPERT_FIELDS.map((sp) => (
                    <button key={sp} type="button" onClick={() => toggleSpecialty(sp)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${newProject.specialties.includes(sp) ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400"}`}>
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={addProject} className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">등록</button>
                <button onClick={() => { setShowForm(false); setNewProject({ ...EMPTY_PROJECT }); }}
                  className="text-sm text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1"><X size={14} />취소</button>
              </div>
            </div>
          )}

          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
              <Plus size={16} />프로젝트 추가
            </button>
          )}
        </div>
      )}

      {tab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
              <Users size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">아직 매칭된 전문가가 없습니다.</p>
            </div>
          ) : matches.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{m.expertName}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.expertMainField}{m.projectTitle && ` · ${m.projectTitle}`}</div>
                {m.note && <div className="text-xs text-gray-400 mt-1">{m.note}</div>}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {matchStatusIcon[m.status]}{matchStatusLabel[m.status]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
