"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Building2, Tag, FolderOpen, Users, ExternalLink } from "lucide-react";
import { getApprovedInstitutions } from "@/lib/storage";
import { Institution } from "@/lib/types";

export default function InstitutionsPage() {
  const [query, setQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);

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
        <p className="text-gray-500">전문가를 필요로 하는 기관과 프로젝트를 확인하세요.</p>
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
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FolderOpen size={15} className="text-blue-500 flex-shrink-0" />{p.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.period && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {p.period}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs bg-blue-600 text-white font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                            <Users size={11} />{p.requiredCount}명 모집
                          </span>
                        </div>
                      </div>
                      {p.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs text-gray-400 mr-1">필요 분야:</span>
                          {p.specialties.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                              <Tag size={9} />{s}
                            </span>
                          ))}
                        </div>
                      )}
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
    </div>
  );
}
