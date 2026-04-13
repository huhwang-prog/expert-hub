"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, UserPlus, Lock, Mail, AlertCircle } from "lucide-react";
import { loginInstitution, saveInstitution } from "@/lib/storage";
import { Institution } from "@/lib/types";

export default function InstitutionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  // 로그인
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // 회원가입
  const [regForm, setRegForm] = useState({ orgName: "", adminName: "", email: "", password: "", password2: "", phone: "" });
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
    await saveInstitution({
      id: crypto.randomUUID(),
      orgName: regForm.orgName,
      adminName: regForm.adminName,
      email: regForm.email,
      password: regForm.password,
      phone: regForm.phone,
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
      <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-md shadow-sm">
        <div className="flex items-center justify-center gap-2 text-blue-700 font-bold text-xl mb-2">
          <Building2 size={22} />기관 담당자
        </div>
        <p className="text-center text-gray-400 text-sm mb-8">정부과제 전문가 수요를 등록하고 매칭을 받아보세요</p>

        {/* 탭 */}
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
          <form onSubmit={handleRegister} className="space-y-3">
            {[
              { label: "기관명", name: "orgName", placeholder: "OO기관 / OO연구소", type: "text" },
              { label: "담당자명", name: "adminName", placeholder: "홍길동", type: "text" },
              { label: "이메일", name: "email", placeholder: "admin@org.kr", type: "email" },
              { label: "연락처", name: "phone", placeholder: "010-0000-0000", type: "text" },
              { label: "비밀번호", name: "password", placeholder: "비밀번호", type: "password" },
              { label: "비밀번호 확인", name: "password2", placeholder: "비밀번호 재입력", type: "password" },
            ].map(({ label, name, placeholder, type }) => (
              <div key={name}>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
                <input type={type} value={regForm[name as keyof typeof regForm]}
                  onChange={(e) => setRegForm((p) => ({ ...p, [name]: e.target.value }))}
                  required placeholder={placeholder} className={inputCls} />
              </div>
            ))}
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
