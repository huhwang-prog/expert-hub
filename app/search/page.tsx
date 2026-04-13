"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, User, Calendar, Tag, Users, Sparkles, Link } from "lucide-react";
import { getApprovedExperts } from "@/lib/storage";
import { Expert } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    getApprovedExperts().then(setExperts);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return experts;
    return experts.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.mainField.toLowerCase().includes(q) ||
      e.tagline.toLowerCase().includes(q) ||
      e.expertise.toLowerCase().includes(q) ||
      e.careerSummary.toLowerCase().includes(q) ||
      e.skills.some((s) => s.toLowerCase().includes(q)) ||
      e.summary.toLowerCase().includes(q) ||
      e.fields.some((f) => f.toLowerCase().includes(q))
    );
  }, [query, experts]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 검색</h1>
        <p className="text-gray-500">이름, 분야, 스킬로 원하는 전문가를 찾아보세요.</p>
      </div>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="키워드로 검색 (예: 투자, 사업화, R&D...)"
          className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Users size={15} />
        총 <strong className="text-gray-900">{filtered.length}</strong>명의 전문가
        {query && <span>· &ldquo;{query}&rdquo; 검색 결과</span>}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((expert) => <ExpertCard key={expert.id} expert={expert} />)}
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(expert.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={22} className="text-blue-600" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900">{expert.name}</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">{expert.mainField}</div>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{expert.tagline}</p>
        </div>
      </div>

      {expert.summary ? (
        <div className="bg-blue-50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-1.5">
            <Sparkles size={11} />AI 요약
          </div>
          <p className={`text-gray-700 text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>{expert.summary}</p>
          {expert.summary.length > 100 && (
            <button onClick={() => setExpanded(!expanded)} className="text-blue-500 text-xs mt-1 hover:underline">
              {expanded ? "접기" : "더 보기"}
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{expert.careerSummary}</p>
      )}

      {expert.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {expert.skills.slice(0, 4).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              <Tag size={9} />{s}
            </span>
          ))}
          {expert.skills.length > 4 && <span className="text-xs text-gray-400">+{expert.skills.length - 4}</span>}
        </div>
      )}

      {expert.collaborationTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expert.collaborationTypes.map((t) => (
            <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar size={11} />{date} 등록
        </div>
        {expert.portfolioLink && (
          <a href={expert.portfolioLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
            <Link size={11} />포트폴리오
          </a>
        )}
      </div>
    </div>
  );
}
