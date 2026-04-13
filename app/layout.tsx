import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expert Hub | 전문가 이력 관리 & 기관 매칭 플랫폼",
  description: "전문가와 기관을 연결하는 신뢰 기반 매칭 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
            © 2026 Expert Hub. 전문가와 기관을 잇는 신뢰 플랫폼.
          </div>
        </footer>
      </body>
    </html>
  );
}
