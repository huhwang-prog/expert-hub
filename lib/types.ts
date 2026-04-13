export interface Expert {
  id: string;
  name: string;
  tagline: string;              // 한 줄 소개
  expertise: string;            // 전문성 및 이력
  mainField: string;            // 메인 전문 분야
  skills: string[];             // 핵심 보유 스킬 태그
  careerSummary: string;        // 주요 경력 요약
  portfolioLink?: string;       // 포트폴리오/링크드인
  contact: string;              // 이메일
  phone: string;
  collaborationTypes: string[]; // 희망 협업 형태
  summary: string;              // AI 요약
  fields: string[];             // AI 분야 태그
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  specialties: string[];
  requiredCount: number;
}

export interface Institution {
  id: string;
  orgName: string;
  description: string;       // 기관 간단 소개
  referenceLink?: string;    // 참고 링크 (선택)
  adminName: string;
  email: string;
  password: string;
  phone: string;
  expertField: string;       // 필요한 전문가 분야
  projects: Project[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Application {
  id: string;
  expertName: string;
  expertMainField: string;
  expertContact: string;   // 이메일
  expertPhone: string;
  message?: string;        // 한 줄 자기소개
  institutionId: string;
  institutionName: string;
  projectId: string;
  projectTitle: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Match {
  id: string;
  expertId: string;
  expertName: string;
  expertMainField: string;
  institutionId: string;
  institutionName: string;
  projectId: string;
  projectTitle: string;
  status: "suggested" | "confirmed" | "cancelled";
  note: string;
  createdAt: string;
}
