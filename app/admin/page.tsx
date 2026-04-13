"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, Lock, ChevronDown, ChevronUp, Sparkles, FileText, ExternalLink, Users, Building2, Link2, CheckCircle2, Clock } from "lucide-react";
import { getAllExperts, updateExpertStatus, deleteExpert, getAllInstitutions, updateInstitutionStatus, deleteInstitution, getAllMatches, saveMatch, updateMatchStatus, deleteMatch, getApprovedExperts, getApprovedInstitutions } from "@/lib/storage";
import { Expert, Institution, Match } from "@/lib/types";

const ADMIN_PASSWORD = "admin1234";
type MainTab = "experts" | "institutions" | "matching";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<MainTab>("experts");

  const [experts, setExperts] = useState<Expert[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 매칭 UI 상태
  const [matchInst, setMatchInst] = useState<Institution | null>(null);
  const [matchProject, setMatchProject] = useState<string>("");
  const [matchNote, setMatchNote] = useState("");

  const load = () => {
    setExperts(getAllExperts());
    setInstitutions(getAllInstitutions());
    setMatches(getAllMatches());
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-sm shadow-sm">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-bold text-lg mb-6"><Lock size={20} />관리자 로그인</div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" className={inputCls} />
            {pwError && <p className="text-red-500 text-xs">비밀번호가 올바르지 않습니다.</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">로그인</button>
          </form>
        </div>
      </div>
    );
  }

  const expCounts = { pending: experts.filter((e) => e.status === "pending").length, approved: experts.filter((e) => e.status === "approved").length, rejected: experts.filter((e) => e.status === "rejected").length };
  const instCounts = { pending: institutions.filter((i) => i.status === "pending").length, approved: institutions.filter((i) => i.status === "approved").length, rejected: institutions.filter((i) => i.status === "rejected").length };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <button onClick={() => setAuthed(false)} className="text-sm text-gray-400 hover:text-gray-600">로그아웃</button>
      </div>

      {/* 메인 탭 */}
      <div className="flex gap-3 mb-8">
        {([
          ["experts", <Users size={15} />, `전문가 관리 (${expCounts.pending} 대기)`],
          ["institutions", <Building2 size={15} />, `기관 관리 (${instCounts.pending} 대기)`],
          ["matching", <Link2 size={15} />, `매칭 관리 (${matches.length})`],
        ] as const).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ─── 전문가 관리 ─── */}
      {tab === "experts" && (
        <ExpertTab experts={experts} onLoad={load} expandedId={expandedId} setExpandedId={setExpandedId} />
      )}

      {/* ─── 기관 관리 ─── */}
      {tab === "institutions" && (
        <InstitutionTab institutions={institutions} onLoad={load} expandedId={expandedId} setExpandedId={setExpandedId} />
      )}

      {/* ─── 매칭 관리 ─── */}
      {tab === "matching" && (
        <MatchingTab
          matches={matches} onLoad={load}
          matchInst={matchInst} setMatchInst={setMatchInst}
          matchProject={matchProject} setMatchProject={setMatchProject}
          matchNote={matchNote} setMatchNote={setMatchNote}
        />
      )}
    </div>
  );
}

/* ── 전문가 탭 ── */
function ExpertTab({ experts, onLoad, expandedId, setExpandedId }: {
  experts: Expert[]; onLoad: () => void; expandedId: string | null; setExpandedId: (v: string | null) => void;
}) {
  const [filter, setFilter] = useState<Expert["status"]>("pending");
  const filtered = experts.filter((e) => e.status === filter);
  const counts = { pending: experts.filter((e) => e.status === "pending").length, approved: experts.filter((e) => e.status === "approved").length, rejected: experts.filter((e) => e.status === "rejected").length };

  return (
    <div>
      <StatusTabs value={filter} onChange={(v) => setFilter(v as Expert["status"])} counts={counts} />
      {filtered.length === 0
        ? <Empty />
        : <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{e.name}</span>
                    <span className="text-gray-400 text-sm">{e.position}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.affiliation}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{e.specialty}</span>
                    {e.certFileName && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1"><FileText size={10} />증빙첨부</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{e.contact} · {new Date(e.createdAt).toLocaleDateString("ko-KR")} 신청</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {filter === "pending" && <>
                    <ActionBtn onClick={() => { updateExpertStatus(e.id, "approved"); onLoad(); }} color="green" icon={<Check size={13} />} label="승인" />
                    <ActionBtn onClick={() => { updateExpertStatus(e.id, "rejected"); onLoad(); }} color="gray" icon={<X size={13} />} label="거절" />
                  </>}
                  {filter === "approved" && <ActionBtn onClick={() => { updateExpertStatus(e.id, "rejected"); onLoad(); }} color="gray" icon={<X size={13} />} label="승인취소" />}
                  {filter === "rejected" && <ActionBtn onClick={() => { updateExpertStatus(e.id, "approved"); onLoad(); }} color="green" icon={<Check size={13} />} label="승인" />}
                  <ActionBtn onClick={() => { if (confirm("삭제?")) { deleteExpert(e.id); onLoad(); } }} color="red" icon={<Trash2 size={13} />} label="삭제" />
                  <button onClick={() => setExpandedId(expandedId === e.id ? null : e.id)} className="text-gray-400 hover:text-gray-600 p-1">
                    {expandedId === e.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {expandedId === e.id && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-gray-50 text-sm">
                  <Row label="최종 학력" value={e.education} />
                  <Row label="주요 경력" value={e.career} pre />
                  {e.evaluations && <Row label="참여 평가 이력" value={e.evaluations} pre />}
                  {e.certFile && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">위촉 증빙 서류</p>
                      <a href={e.certFile} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline border border-blue-200 rounded-lg px-3 py-1.5 bg-blue-50">
                        <ExternalLink size={12} />{e.certFileName ?? "파일 보기"}
                      </a>
                    </div>
                  )}
                  {e.summary && (
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-1.5"><Sparkles size={11} />AI 요약</div>
                      <p className="text-gray-700 leading-relaxed">{e.summary}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {e.fields.map((f) => <span key={f} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{f}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ── 기관 탭 ── */
function InstitutionTab({ institutions, onLoad, expandedId, setExpandedId }: {
  institutions: Institution[]; onLoad: () => void; expandedId: string | null; setExpandedId: (v: string | null) => void;
}) {
  const [filter, setFilter] = useState<Institution["status"]>("pending");
  const filtered = institutions.filter((i) => i.status === filter);
  const counts = { pending: institutions.filter((i) => i.status === "pending").length, approved: institutions.filter((i) => i.status === "approved").length, rejected: institutions.filter((i) => i.status === "rejected").length };

  return (
    <div>
      <StatusTabs value={filter} onChange={(v) => setFilter(v as Institution["status"])} counts={counts} />
      {filtered.length === 0
        ? <Empty />
        : <div className="space-y-3">
          {filtered.map((inst) => (
            <div key={inst.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{inst.orgName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inst.adminName}</span>
                    <span className="text-xs text-gray-400">{inst.projects.length}개 과제</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{inst.email} · {inst.phone}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {filter === "pending" && <>
                    <ActionBtn onClick={() => { updateInstitutionStatus(inst.id, "approved"); onLoad(); }} color="green" icon={<Check size={13} />} label="승인" />
                    <ActionBtn onClick={() => { updateInstitutionStatus(inst.id, "rejected"); onLoad(); }} color="gray" icon={<X size={13} />} label="거절" />
                  </>}
                  {filter === "approved" && <ActionBtn onClick={() => { updateInstitutionStatus(inst.id, "rejected"); onLoad(); }} color="gray" icon={<X size={13} />} label="승인취소" />}
                  {filter === "rejected" && <ActionBtn onClick={() => { updateInstitutionStatus(inst.id, "approved"); onLoad(); }} color="green" icon={<Check size={13} />} label="승인" />}
                  <ActionBtn onClick={() => { if (confirm("삭제?")) { deleteInstitution(inst.id); onLoad(); } }} color="red" icon={<Trash2 size={13} />} label="삭제" />
                  <button onClick={() => setExpandedId(expandedId === inst.id ? null : inst.id)} className="text-gray-400 hover:text-gray-600 p-1">
                    {expandedId === inst.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {expandedId === inst.id && inst.projects.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-5 bg-gray-50 space-y-3">
                  <p className="text-xs font-semibold text-gray-500">등록 과제</p>
                  {inst.projects.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="font-semibold text-sm text-gray-800 mb-1">{p.title}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.agency} · {p.period} · 위원 {p.requiredCount}명</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.specialties.map((s) => <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ── 매칭 탭 ── */
function MatchingTab({ matches, onLoad, matchInst, setMatchInst, matchProject, setMatchProject, matchNote, setMatchNote }: {
  matches: Match[]; onLoad: () => void;
  matchInst: Institution | null; setMatchInst: (v: Institution | null) => void;
  matchProject: string; setMatchProject: (v: string) => void;
  matchNote: string; setMatchNote: (v: string) => void;
}) {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const approvedExperts = getApprovedExperts();
  const approvedInsts = getApprovedInstitutions();

  const selectedProjectObj = matchInst?.projects.find((p) => p.id === matchProject);

  const suggestedExperts = selectedProjectObj
    ? approvedExperts.filter((e) => selectedProjectObj.specialties.includes(e.specialty))
    : [];

  const doMatch = () => {
    if (!selectedExpert || !matchInst || !matchProject || !selectedProjectObj) return;
    saveMatch({
      id: crypto.randomUUID(),
      expertId: selectedExpert.id, expertName: selectedExpert.name, expertSpecialty: selectedExpert.specialty,
      institutionId: matchInst.id, institutionName: matchInst.orgName,
      projectId: matchProject, projectTitle: selectedProjectObj.title,
      status: "suggested", note: matchNote,
      createdAt: new Date().toISOString(),
    });
    onLoad();
    setSelectedExpert(null); setMatchNote("");
    alert(`${selectedExpert.name} 전문가 → ${matchInst.orgName} 매칭 제안 완료!`);
  };

  return (
    <div className="space-y-8">
      {/* 매칭 생성 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Link2 size={16} className="text-blue-600" />새 매칭 제안</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* 기관 선택 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">기관 선택</label>
            <select className={inputCls} value={matchInst?.id ?? ""}
              onChange={(e) => { const inst = approvedInsts.find((i) => i.id === e.target.value) ?? null; setMatchInst(inst); setMatchProject(""); setSelectedExpert(null); }}>
              <option value="">기관 선택...</option>
              {approvedInsts.map((i) => <option key={i.id} value={i.id}>{i.orgName}</option>)}
            </select>
          </div>
          {/* 과제 선택 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">과제 선택</label>
            <select className={inputCls} value={matchProject} onChange={(e) => { setMatchProject(e.target.value); setSelectedExpert(null); }} disabled={!matchInst}>
              <option value="">과제 선택...</option>
              {matchInst?.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        {selectedProjectObj && (
          <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-800 mb-1">{selectedProjectObj.title}</p>
            <p className="text-gray-500 text-xs mb-2">필요 분야: {selectedProjectObj.specialties.join(", ")} · 위원 {selectedProjectObj.requiredCount}명</p>
            <p className="text-xs font-semibold text-gray-600 mb-2">해당 분야 전문가 ({suggestedExperts.length}명)</p>
            <div className="space-y-2">
              {suggestedExperts.length === 0
                ? <p className="text-xs text-gray-400">해당 분야 승인된 전문가가 없습니다.</p>
                : suggestedExperts.map((e) => (
                  <button key={e.id} onClick={() => setSelectedExpert(selectedExpert?.id === e.id ? null : e)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${selectedExpert?.id === e.id ? "border-blue-500 bg-blue-100" : "border-gray-200 bg-white hover:border-blue-300"}`}>
                    <span className="font-semibold text-sm text-gray-900">{e.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{e.position} · {e.affiliation}</span>
                    {e.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{e.summary}</p>}
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {selectedExpert && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">메모 (선택)</label>
              <input value={matchNote} onChange={(e) => setMatchNote(e.target.value)} placeholder="기관에 전달할 메모..." className={inputCls} />
            </div>
            <button onClick={doMatch}
              className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Link2 size={14} />{selectedExpert.name} → {matchInst?.orgName} 매칭 제안
            </button>
          </div>
        )}
      </div>

      {/* 매칭 목록 */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">매칭 현황 ({matches.length})</h2>
        {matches.length === 0
          ? <Empty />
          : <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{m.expertName}</span>
                    <span className="text-gray-400 text-sm">→</span>
                    <span className="font-semibold text-blue-700">{m.institutionName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.projectTitle} · {m.expertSpecialty}</div>
                  {m.note && <div className="text-xs text-gray-400 mt-0.5">{m.note}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${m.status === "confirmed" ? "bg-green-50 text-green-600" : m.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"}`}>
                    {m.status === "confirmed" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {m.status === "suggested" ? "검토 중" : m.status === "confirmed" ? "확정" : "취소"}
                  </span>
                  {m.status === "suggested" && <ActionBtn onClick={() => { updateMatchStatus(m.id, "confirmed"); onLoad(); }} color="green" icon={<Check size={13} />} label="확정" />}
                  <ActionBtn onClick={() => { if (confirm("삭제?")) { deleteMatch(m.id); onLoad(); } }} color="red" icon={<Trash2 size={13} />} label="삭제" />
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}

/* ── 공통 컴포넌트 ── */
function StatusTabs({ value, onChange, counts }: { value: string; onChange: (v: string) => void; counts: Record<string, number> }) {
  const tabs = [
    { key: "pending", label: "승인 대기", active: "bg-yellow-500 text-white", inactive: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    { key: "approved", label: "승인됨", active: "bg-green-600 text-white", inactive: "bg-green-50 text-green-700 border border-green-200" },
    { key: "rejected", label: "거절됨", active: "bg-red-500 text-white", inactive: "bg-red-50 text-red-700 border border-red-200" },
  ];
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${value === t.key ? t.active : t.inactive}`}>
          {t.label} ({counts[t.key]})
        </button>
      ))}
    </div>
  );
}

function ActionBtn({ onClick, color, icon, label }: { onClick: () => void; color: "green" | "gray" | "red"; icon: React.ReactNode; label: string }) {
  const cls = { green: "bg-green-600 text-white hover:bg-green-700", gray: "bg-gray-200 text-gray-700 hover:bg-gray-300", red: "bg-red-50 text-red-500 hover:bg-red-100" };
  return (
    <button onClick={onClick} className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${cls[color]}`}>
      {icon}{label}
    </button>
  );
}

function Row({ label, value, pre }: { label: string; value: string; pre?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>
      {pre ? <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{value}</pre>
        : <p className="text-sm text-gray-700">{value}</p>}
    </div>
  );
}

function Empty() {
  return <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">해당 항목이 없습니다.</div>;
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
