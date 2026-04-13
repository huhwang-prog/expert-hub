export interface CareerItem {
  period: string;  // 기간 (예: 2020~현재)
  org: string;     // 소속
  role: string;    // 주요 업무
}

export interface Expert {
  id: string;
  name: string;
  affiliation: string;
  position: string;
  specialty: string;
  education: string;
  careers: CareerItem[];
  evaluations: string;
  phone: string;
  contact: string;       // 이메일
  certFile?: string;     // base64 위촉 증빙
  certFileName?: string;
  summary: string;
  fields: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  agency: string;
  period: string;
  specialties: string[];
  requiredCount: number;
  description: string;
}

export interface Institution {
  id: string;
  orgName: string;
  adminName: string;
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
