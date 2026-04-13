"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, UserPlus, Lock, Mail, AlertCircle, Phone, Link, FileText, ClipboardList } from "lucide-react";
import { loginInstitution, saveInstitution } from "@/lib/storage";
import { Institution } from "@/lib/types";
import { EXPERT_FIELDS } from "@/lib/constants";

export default function InstitutionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [regForm, setRegForm] = useState({
    orgName: "",
    description: "",
    referenceLink: "",
    adminName: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    expertField: "",
  });
  const [regError, setRegError] = useState("");
  const [regDone, setRegDone] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inst = await loginInstitution(loginForm.email, loginForm.password);
    if (!inst) { setLoginError("이메일 또는 비밀번호가 올바르지 않습니다."); return; }
    if (inst.status !== "approved") { setLoginError("관리자 승인 대기 중입니다. 승인 후 로그인 가능합니다."); return; }
    sessionStorage.setItem("inst_id", inst.id);
    router.push("/institution/dashboard");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (regForm.password !== regForm.password2) { setRegError("비밀번호가 일치하지 않습니다."); return; }
    if (!regForm.expertField) { setRegError("필요한 전문가 분야를 선택해주세요."); return; }
    await saveInstitution({
      id: crypto.randomUUID(),
      orgName: regForm.orgName,
      description: regForm.description,
      referenceLink: regForm.referenceLink || undefined,
      adminName: regForm.adminName,
      email: regForm.email,
      password: regForm.password,
      phone: regForm.phone,
      expertField: regForm.expertField,
      projects: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    } satisfies Institution);
    setRegDone(true);
  };

  if (regDone) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <Building2 size={56} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">가입 신청 완료!</h2>
          <p className="text-gray-500 mb-6">관리자 승인 후 로그인하실 수 있습니다.</p>
          <button onClick={() => { setMode("login"); setRegDone(false); }} className="text-sm text-blue-600 hover:underline">로그인 화면으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-lg shadow-sm">
        <div className="flex items-center justify-center gap-2 text-blue-700 font-bold text-xl mb-2">
          <Building2 size={22} />기관 담당자
        </div>
        <p className="text-center text-gray-400 text-sm mb-8">정부과제 전문가 수요를 등록하고 매칭을 받아보세요</p>

        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-7">
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {m === "login" ? "로그인" : "기관 가입"}
            </button>
          ))}
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Mail size={12} />이메일</label>
              <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                required placeholder="기관 이메일" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Lock size={12} />비밀번호</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                required placeholder="비밀번호" className={inputCls} />
            </div>
            {loginError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <LogIn size={16} />로그인
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* 기관 기본 정보 */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-1">기관 기본 정보</p>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Building2 size={12} />기관명 <span className="text-red-500">*</span></label>
              <input type="text" value={regForm.orgName} onChange={(e) => setRegForm((p) => ({ ...p, orgName: e.target.value }))}
                required placeholder="OO기관 / OO연구소" className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><FileText size={12} />기관 간단 소개 <span className="text-red-500">*</span></label>
              <textarea value={regForm.description} onChange={(e) => setRegForm((p) => ({ ...p, description: e.target.value }))}
                required rows={3} placeholder="어떤 기관인지 2~3줄로 간략히 소개해주세요." className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Link size={12} />참고 링크 <span className="text-gray-400 font-normal">(선택)</span></label>
              <input type="url" value={regForm.referenceLink} onChange={(e) => setRegForm((p) => ({ ...p, referenceLink: e.target.value }))}
                placeholder="https://... (웹사이트, SNS, 노션 등)" className={inputCls} />
            </div>

            {/* 담당자 연락 정보 */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">담당자 연락 정보</p>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">담당자 성함 <span className="text-red-500">*</span></label>
              <input type="text" value={regForm.adminName} onChange={(e) => setRegForm((p) => ({ ...p, adminName: e.target.value }))}
                required placeholder="홍길동" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Mail size={12} />이메일 <span className="text-red-500">*</span></label>
                <input type="email" value={regForm.email} onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                  required placeholder="admin@org.kr" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Phone size={12} />연락처 <span className="text-red-500">*</span></label>
                <input type="tel" value={regForm.phone} onChange={(e) => setRegForm((p) => ({ ...p, phone: e.target.value }))}
                  required placeholder="010-0000-0000" className={inputCls} />
              </div>
            </div>

            {/* 전문가 탐색 정보 */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">전문가 탐색 정보</p>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><ClipboardList size={12} />필요한 전문가 분야 <span className="text-red-500">*</span></label>
              <select value={regForm.expertField} onChange={(e) => setRegForm((p) => ({ ...p, expertField: e.target.value }))}
                required className={inputCls}>
                <option value="">선택하세요</option>
                {EXPERT_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* 비밀번호 */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2">계정 설정</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Lock size={12} />비밀번호 <span className="text-red-500">*</span></label>
                <input type="password" value={regForm.password} onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                  required placeholder="비밀번호" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">비밀번호 확인 <span className="text-red-500">*</span></label>
                <input type="password" value={regForm.password2} onChange={(e) => setRegForm((p) => ({ ...p, password2: e.target.value }))}
                  required placeholder="비밀번호 재입력" className={inputCls} />
              </div>
            </div>

            {regError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{regError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-1">
              <UserPlus size={16} />가입 신청
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
