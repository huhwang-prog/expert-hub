"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserPlus, Building2, Settings, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg flex-shrink-0">
          <Users size={22} />Expert Hub
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/search" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active("/search") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
            <Search size={14} />전문가 검색
          </Link>
          <Link href="/institutions" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active("/institutions") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
            <Building2 size={14} />기관 수요
          </Link>
          <Link href="/institution" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active("/institution") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
            기관 로그인
          </Link>
          <Link href="/admin" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active("/admin") ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            <Settings size={14} />관리자
          </Link>
          <Link href="/expert" className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus size={15} />전문가 등록
          </Link>
        </nav>
      </div>
    </header>
  );
}
