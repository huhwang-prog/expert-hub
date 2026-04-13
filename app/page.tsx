import Link from "next/link";
import { UserPlus, Search, Award, Shield, Zap, Users, Building2, Link2 } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Zap size={14} />
            AI 기반 전문 분야 자동 요약
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            전문가와 기관을 잇는<br />
            <span className="text-yellow-300">신뢰 기반 매칭 플랫폼</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            이력을 등록하면 AI가 핵심 전문 분야를 요약합니다.<br />
            기관 담당자는 검색 한 번으로 최적의 전문가를 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/expert"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-lg"
            >
              <UserPlus size={18} />
              전문가로 등록하기
            </Link>
            <Link
              href="/institution"
              className="inline-flex items-center justify-center gap-2 bg-blue-800/50 border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-800/70 transition-colors text-base"
            >
              <Building2 size={18} />
              기관 담당자 입장
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "1,200+", label: "등록 전문가" },
            { value: "380+", label: "파트너 기관" },
            { value: "98%", label: "매칭 만족도" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-blue-700">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
          Expert Hub가 특별한 이유
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Zap size={28} className="text-blue-600" />,
              title: "AI 핵심 분야 요약",
              desc: "이력을 입력하면 AI가 자동으로 핵심 전문 분야와 역량을 분석해 요약합니다.",
            },
            {
              icon: <Link2 size={28} className="text-blue-600" />,
              title: "전문가 ↔ 기관 매칭",
              desc: "정부과제를 보유한 기관과 적합한 전문가를 관리자가 직접 연결해 드립니다.",
            },
            {
              icon: <Search size={28} className="text-blue-600" />,
              title: "스마트 검색",
              desc: "키워드 검색으로 전문가와 기관 수요를 한 번에 빠르게 찾습니다.",
            },
            {
              icon: <Shield size={28} className="text-blue-600" />,
              title: "신뢰 기반 프로필",
              desc: "위촉 증빙 서류 첨부와 관리자 승인으로 검증된 전문가 풀을 제공합니다.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Award size={36} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            이력 등록부터 기관 매칭까지, Expert Hub 하나로 해결하세요.
          </p>
          <Link
            href="/expert"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Users size={18} />
            무료로 등록하기
          </Link>
        </div>
      </section>
    </div>
  );
}
