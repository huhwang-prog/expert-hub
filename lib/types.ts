export interface Expert {
  id: string;
  name: string;
  affiliation: string;
  position: string;       // 직위/직책
  specialty: string;      // 전문 분야
  education: string;      // 최종 학력
  career: string;         // 주요 경력
  evaluations: string;    // 참여 평가 이력
  contact: string;        // 이메일
  summary: string;        // AI 요약
  fields: string[];       // AI 추출 키워드
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
