"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, User, Building2, Calendar, Tag, Users, Sparkles, Briefcase } from "lucide-react";
import { getApprovedExperts } from "@/lib/storage";
import { Expert, CareerItem } from "@/lib/types";


function careersToText(careers: CareerItem[]): string {
  return careers.map((c) => `${c.period} ${c.org} ${c.role}`).join(" ");
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    getApprovedExperts().then((stored) => {
      setExperts(stored);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return experts;
    return experts.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.affiliation.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.specialty.toLowerCase().includes(q) ||
        careersToText(e.careers ?? []).toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.fields.some((f) => f.toLowerCase().includes(q))
    );
  }, [query, experts]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전문가 검색</h1>
        <p className="text-gray-500">이름, 소속, 전문 분야로 원하는 전문가를 찾아보세요.</p>
      </div>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="키워드로 검색 (예: 인공지능, 서울대, 핀테크...)"
          className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
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
          {filtered.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(expert.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
  });
  const careerPreview = expert.careers?.[0]
    ? `${expert.careers[0].period} ${expert.careers[0].org} ${expert.careers[0].role}`
    : "";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={22} className="text-blue-600" />
        </div>
        <div>
          <div className="font-bold text-gray-900">{expert.name}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Briefcase size={11} />{expert.position}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Building2 size={11} />{expert.affiliation}
          </div>
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
        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{careerPreview}</p>
      )}

      {expert.fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {expert.fields.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              <Tag size={9} />{f}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 border-t border-gray-100 mt-auto">
        <Calendar size={11} />{date} 등록
      </div>
    </div>
  );
}
