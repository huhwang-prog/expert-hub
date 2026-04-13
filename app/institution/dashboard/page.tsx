"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, LogOut, FolderOpen, Users, Tag, X, CheckCircle2, Clock, XCircle, Check, Bell } from "lucide-react";
import { getAllInstitutions, updateInstitution, getAllMatches, getAllApplications, updateApplicationStatus, deleteApplication, saveMatch, getApprovedExperts } from "@/lib/storage";
import { Institution, Project, Match, Application, Expert } from "@/lib/types";
import { EXPERT_FIELDS } from "@/lib/constants";

const EMPTY_PROJECT = { title: "", period: "", specialties: [] as string[], requiredCount: 1 };

export default function InstitutionDashboard() {
  const router = useRouter();
  const [inst, setInst] = useState<Institution | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expertMap, setExpertMap] = useState<Record<string, Expert>>({});
  const [tab, setTab] = useState<"projects" | "applications" | "matches">("projects");
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ ...EMPTY_PROJECT });

  const loadData = async (instId: string) => {
    const [allApps, allMatches, approvedExperts] = await Promise.all([
      getAllApplications(), getAllMatches(), getApprovedExperts(),
    ]);
    setApplications(allApps.filter((a) => a.institutionId === instId));
    setMatches(allMatches.filter((m) => m.institutionId === instId));
    // 이름 기준으로 등록된 전문가 매핑
    const map: Record<string, Expert> = {};
    approvedExperts.forEach((e) => { map[e.name] = e; });
    setExpertMap(map);
  };

  useEffect(() => {
    const id = sessionStorage.getItem("inst_id");
    if (!id) { router.push("/institution"); return; }
    getAllInstitutions().then((insts) => {
      const found = insts.find((i) => i.id === id);
      if (!found) { router.push("/institution"); return; }
      setInst(found);
      loadData(id);
    });
  }, [router]);

  if (!inst) return null;

  const pendingApps = applications.filter((a) => a.status === "pending").length;
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

  const approveApplication = async (app: Application) => {
    await updateApplicationStatus(app.id, "approved");
    // 매칭 자동 생성
    await saveMatch({
      id: crypto.randomUUID(),
      expertId: "",
      expertName: app.expertName,
      expertMainField: app.expertMainField ?? "",
      institutionId: inst.id,
      institutionName: inst.orgName,
      projectId: app.projectId,
      projectTitle: app.projectTitle,
      status: "confirmed",
      note: app.message ?? "",
      createdAt: new Date().toISOString(),
    });
    await loadData(inst.id);
  };

  const rejectApplication = async (id: string) => {
    await updateApplicationStatus(id, "rejected");
    await loadData(inst.id);
  };

  const removeApplication = async (id: string) => {
    if (!confirm("신청을 삭제할까요?")) return;
    await deleteApplication(id);
    await loadData(inst.id);
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
      <div className="flex gap-2 mb-8 flex-wrap">
        {([
          ["projects", <FolderOpen size={15} key="f" />, `프로젝트 (${inst.projects.length})`],
          ["applications", <Bell size={15} key="b" />, `전문가 신청 (${pendingApps > 0 ? `${pendingApps}개 대기` : applications.length})`],
          ["matches", <Users size={15} key="u" />, `매칭 확정 (${matches.length})`],
        ] as const).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : `bg-white border ${t === "applications" && pendingApps > 0 ? "border-orange-300 text-orange-600" : "border-gray-200 text-gray-600"} hover:border-blue-300`}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ─── 프로젝트 탭 ─── */}
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
                <input value={newProject.title} onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 2026년 초기창업패키지 서면평가" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">필요 기간</label>
                <input value={newProject.period} onChange={(e) => setNewProject((p) => ({ ...p, period: e.target.value }))}
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

      {/* ─── 전문가 신청 탭 ─── */}
      {tab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
              <Bell size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">아직 신청한 전문가가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 대기 중 */}
              {applications.filter((a) => a.status === "pending").map((a) => (
                <ApplicationCard key={a.id} app={a} expert={expertMap[a.expertName]}
                  onApprove={() => approveApplication(a)}
                  onReject={() => rejectApplication(a.id)}
                  onDelete={() => removeApplication(a.id)} />
              ))}
              {/* 처리 완료 */}
              {applications.filter((a) => a.status !== "pending").length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-3 mt-6">처리 완료</p>
                  {applications.filter((a) => a.status !== "pending").map((a) => (
                    <ApplicationCard key={a.id} app={a} expert={expertMap[a.expertName]}
                      onApprove={() => approveApplication(a)}
                      onReject={() => rejectApplication(a.id)}
                      onDelete={() => removeApplication(a.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── 매칭 확정 탭 ─── */}
      {tab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
              <Users size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">확정된 매칭이 없습니다.</p>
            </div>
          ) : matches.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{m.expertName}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.expertMainField}{m.projectTitle && ` · ${m.projectTitle}`}</div>
                {m.note && <div className="text-xs text-gray-400 mt-1">{m.note}</div>}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                {matchStatusIcon[m.status]}{matchStatusLabel[m.status]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, expert, onApprove, onReject, onDelete }: {
  app: Application;
  expert?: Expert;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = {
    pending: "bg-yellow-50 border-yellow-200",
    approved: "bg-green-50 border-green-200",
    rejected: "bg-gray-50 border-gray-200",
  };

  return (
    <div className={`border rounded-2xl overflow-hidden mb-3 ${statusStyle[app.status]}`}>
      {/* 상단: 이름 + 상태 + 버튼 */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-900">{app.expertName}</span>
            {app.expertMainField && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{app.expertMainField}</span>}
            {expert && <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">등록 전문가</span>}
            {app.status === "pending" && <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">검토 대기</span>}
            {app.status === "approved" && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">승인됨</span>}
            {app.status === "rejected" && <span className="text-xs bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full">거절됨</span>}
          </div>
          <p className="text-xs text-gray-500">{app.expertContact} · {app.expertPhone}</p>
          <p className="text-xs text-gray-400 mt-0.5">신청 프로젝트: {app.projectTitle}</p>
          {app.message && <p className="text-sm text-gray-600 mt-2 bg-white rounded-xl px-3 py-2 border border-gray-100">{app.message}</p>}
          {/* 등록 전문가면 상세보기 토글 */}
          {expert && (
            <button onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-blue-500 hover:underline">
              {expanded ? "프로필 접기" : "전문가 프로필 보기"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {app.status === "pending" && (
            <>
              <button onClick={onApprove}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                <Check size={12} />승인
              </button>
              <button onClick={onReject}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                <X size={12} />거절
              </button>
            </>
          )}
          <button onClick={onDelete}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
            <Trash2 size={12} />삭제
          </button>
        </div>
      </div>

      {/* 등록 전문가 프로필 상세 */}
      {expert && expanded && (
        <div className="border-t border-white/60 bg-white px-5 py-4 space-y-3 text-sm">
          {expert.tagline && <p className="text-gray-600 font-medium">{expert.tagline}</p>}
          {expert.expertise && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">전문성 및 이력</p>
              <p className="text-gray-700 text-xs leading-relaxed">{expert.expertise}</p>
            </div>
          )}
          {expert.careerSummary && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">경력 요약</p>
              <p className="text-gray-700 text-xs leading-relaxed">{expert.careerSummary}</p>
            </div>
          )}
          {expert.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expert.skills.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {expert.collaborationTypes?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expert.collaborationTypes.map((t) => (
                <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
          {expert.summary && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">✦ AI 요약</p>
              <p className="text-xs text-gray-700 leading-relaxed">{expert.summary}</p>
            </div>
          )}
          {expert.portfolioLink && (
            <a href={expert.portfolioLink} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline inline-block">
              포트폴리오 바로가기 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
