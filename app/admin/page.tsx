"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, Lock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { getAllExperts, updateExpertStatus, deleteExpert } from "@/lib/storage";
import { Expert } from "@/lib/types";

const ADMIN_PASSWORD = "admin1234";

type Tab = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => setExperts(getAllExperts());

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleApprove = (id: string) => { updateExpertStatus(id, "approved"); load(); };
  const handleReject = (id: string) => { updateExpertStatus(id, "rejected"); load(); };
  const handleDelete = (id: string) => { if (confirm("삭제하시겠습니까?")) { deleteExpert(id); load(); } };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-sm shadow-sm">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-bold text-lg mb-6">
            <Lock size={20} />관리자 로그인
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {pwError && <p className="text-red-500 text-xs">비밀번호가 올바르지 않습니다.</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = experts.filter((e) => e.status === tab);
  const counts = {
    pending: experts.filter((e) => e.status === "pending").length,
    approved: experts.filter((e) => e.status === "approved").length,
    rejected: experts.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <button onClick={() => setAuthed(false)} className="text-sm text-gray-400 hover:text-gray-600">로그아웃</button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-8">
        {(["pending", "approved", "rejected"] as Tab[]).map((t) => {
          const labels = { pending: "승인 대기", approved: "승인됨", rejected: "거절됨" };
          const colors = {
            pending: tab === t ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 border border-yellow-200",
            approved: tab === t ? "bg-green-600 text-white" : "bg-green-50 text-green-700 border border-green-200",
            rejected: tab === t ? "bg-red-500 text-white" : "bg-red-50 text-red-700 border border-red-200",
          };
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${colors[t]}`}>
              {labels[t]} ({counts[t]})
            </button>
          );
        })}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200">
          해당 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((expert) => (
            <div key={expert.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* 헤더 행 */}
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{expert.name}</span>
                    <span className="text-gray-400 text-sm">{expert.position}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{expert.affiliation}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{expert.specialty}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{expert.contact} · {new Date(expert.createdAt).toLocaleDateString("ko-KR")} 신청</div>
                </div>
                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tab === "pending" && (
                    <>
                      <button onClick={() => handleApprove(expert.id)}
                        className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                        <Check size={13} />승인
                      </button>
                      <button onClick={() => handleReject(expert.id)}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors">
                        <X size={13} />거절
                      </button>
                    </>
                  )}
                  {tab === "approved" && (
                    <button onClick={() => handleReject(expert.id)}
                      className="flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors">
                      <X size={13} />승인 취소
                    </button>
                  )}
                  {tab === "rejected" && (
                    <button onClick={() => handleApprove(expert.id)}
                      className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                      <Check size={13} />승인
                    </button>
                  )}
                  <button onClick={() => handleDelete(expert.id)}
                    className="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 size={13} />삭제
                  </button>
                  <button onClick={() => setExpanded(expanded === expert.id ? null : expert.id)}
                    className="text-gray-400 hover:text-gray-600 p-1">
                    {expanded === expert.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* 상세 펼침 */}
              {expanded === expert.id && (
                <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-gray-50">
                  <Row label="최종 학력" value={expert.education} />
                  <Row label="주요 경력" value={expert.career} pre />
                  {expert.evaluations && <Row label="참여 평가 이력" value={expert.evaluations} pre />}
                  {expert.summary && (
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-1.5">
                        <Sparkles size={11} />AI 요약
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{expert.summary}</p>
                      {expert.fields.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {expert.fields.map((f) => (
                            <span key={f} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, pre }: { label: string; value: string; pre?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>
      {pre
        ? <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{value}</pre>
        : <p className="text-sm text-gray-700">{value}</p>
      }
    </div>
  );
}
