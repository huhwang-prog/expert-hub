export interface Expert {
  id: string;
  name: string;
  affiliation: string;
  position: string;
  specialty: string;
  education: string;
  career: string;
  evaluations: string;
  contact: string;
  certFile?: string;      // base64 위촉 증빙 파일
  certFileName?: string;
  summary: string;
  fields: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;           // 과제명
  agency: string;          // 주관기관 (예: 중소벤처기업부)
  period: string;          // 기간
  specialties: string[];   // 필요 전문 분야
  requiredCount: number;   // 필요 위원 수
  description: string;
}

export interface Institution {
  id: string;
  orgName: string;         // 기관명
  adminName: string;       // 담당자명
  email: string;
  password: string;
  phone: string;
  projects: Project[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Match {
  id: string;
  expertId: string;
  expertName: string;
  expertSpecialty: string;
  institutionId: string;
  institutionName: string;
  projectId: string;
  projectTitle: string;
  status: "suggested" | "confirmed" | "cancelled";
  note: string;
  createdAt: string;
}
