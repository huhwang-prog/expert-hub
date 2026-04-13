"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, User, Building2, Calendar, Tag, Users, Sparkles, Briefcase } from "lucide-react";
import { getApprovedExperts } from "@/lib/storage";
import { Expert } from "@/lib/types";

const SAMPLE_EXPERTS: Expert[] = [
  {
    id: "sample-1",
    name: "김민준",
    affiliation: "서울대학교 컴퓨터공학과",
    position: "교수",
    specialty: "IT/소프트웨어",
    education: "MIT 컴퓨터공학 박사",
    career: "2018~현재  서울대학교 컴퓨터공학과 교수\n2013~2018  삼성전자 AI 연구소 수석연구원",
    evaluations: "2024  중소벤처기업부 기술평가위원\n2023  산업통상자원부 R&D 심사위원",
    contact: "kiminjun@snu.ac.kr",
    summary: "AI·머신러닝 분야 15년 경력의 연구자로, 자연어처리 및 컴퓨터 비전 논문 30여 편을 발표하고 산업계 AI 솔루션 개발에 기여했습니다.",
    fields: ["인공지능", "자연어처리", "컴퓨터 비전"],
    status: "approved",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "sample-2",
    name: "이수연",
    affiliation: "한국과학기술연구원(KIST)",
    position: "수석연구원",
    specialty: "R&D/기술",
    education: "서울대학교 화학공학 박사",
    career: "2015~현재  KIST 바이오연구소 수석연구원\n2010~2015  한국화학연구원 선임연구원",
    evaluations: "2024  보건복지부 신약개발 심사위원\n2022  식품의약품안전처 기술평가위원",
    contact: "suyon.lee@kist.re.kr",
    summary: "항암 신약 개발에 15년간 종사한 바이오 전문가로, 특허 12건을 보유하고 국내외 제약사 자문 역할을 수행해왔습니다.",
    fields: ["바이오테크", "신약개발", "항암제 연구"],
    status: "approved",
    createdAt: "2026-04-02T10:00:00Z",
  },
  {
    id: "sample-3",
    name: "박지훈",
    affiliation: "카카오 전략기획팀",
    position: "팀장",
    specialty: "경영/전략",
    education: "연세대학교 경영학 석사",
    career: "2019~현재  카카오 전략기획팀장\n2012~2019  한국투자파트너스 수석심사역",
    evaluations: "2024  창업진흥원 사업화 평가위원\n2023  중소벤처기업부 벤처확인심사위원",
    contact: "jihun.park@kakao.com",
    summary: "벤처캐피탈과 대기업에서 쌓은 투자·M&A 전문성으로 핀테크·헬스케어 스타트업에 누적 300억 이상을 집행한 전략 전문가입니다.",
    fields: ["스타트업 투자", "M&A", "핀테크"],
    status: "approved",
    createdAt: "2026-04-03T11:00:00Z",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    const stored = getApprovedExperts();
    setExperts([...stored, ...SAMPLE_EXPERTS]);
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
        e.career.toLowerCase().includes(q) ||
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
  const date = new Date(expert.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
  });

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
          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">{expert.summary}</p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{expert.career}</p>
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
