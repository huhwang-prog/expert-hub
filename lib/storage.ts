"use client";

import { Expert, Institution, Match } from "./types";

/* ─── 전문가 ─── */
const EXP_KEY = "expert_hub_experts";

export function getAllExperts(): Expert[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(EXP_KEY) || "[]"); } catch { return []; }
}
export function getApprovedExperts(): Expert[] {
  return getAllExperts().filter((e) => e.status === "approved");
}
export function saveExpert(expert: Expert): void {
  const list = getAllExperts();
  list.unshift(expert);
  localStorage.setItem(EXP_KEY, JSON.stringify(list));
}
export function updateExpertStatus(id: string, status: Expert["status"]): void {
  localStorage.setItem(EXP_KEY, JSON.stringify(
    getAllExperts().map((e) => e.id === id ? { ...e, status } : e)
  ));
}
export function deleteExpert(id: string): void {
  localStorage.setItem(EXP_KEY, JSON.stringify(getAllExperts().filter((e) => e.id !== id)));
}

/* ─── 기관 ─── */
const INST_KEY = "expert_hub_institutions";

export function getAllInstitutions(): Institution[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(INST_KEY) || "[]"); } catch { return []; }
}
export function getApprovedInstitutions(): Institution[] {
  return getAllInstitutions().filter((i) => i.status === "approved");
}
export function saveInstitution(inst: Institution): void {
  const list = getAllInstitutions();
  list.unshift(inst);
  localStorage.setItem(INST_KEY, JSON.stringify(list));
}
export function updateInstitution(inst: Institution): void {
  localStorage.setItem(INST_KEY, JSON.stringify(
    getAllInstitutions().map((i) => i.id === inst.id ? inst : i)
  ));
}
export function updateInstitutionStatus(id: string, status: Institution["status"]): void {
  localStorage.setItem(INST_KEY, JSON.stringify(
    getAllInstitutions().map((i) => i.id === id ? { ...i, status } : i)
  ));
}
export function deleteInstitution(id: string): void {
  localStorage.setItem(INST_KEY, JSON.stringify(getAllInstitutions().filter((i) => i.id !== id)));
}
export function findInstitutionByEmail(email: string, password: string): Institution | null {
  return getAllInstitutions().find((i) => i.email === email && i.password === password) ?? null;
}

/* ─── 매칭 ─── */
const MATCH_KEY = "expert_hub_matches";

export function getAllMatches(): Match[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(MATCH_KEY) || "[]"); } catch { return []; }
}
export function saveMatch(match: Match): void {
  const list = getAllMatches();
  list.unshift(match);
  localStorage.setItem(MATCH_KEY, JSON.stringify(list));
}
export function updateMatchStatus(id: string, status: Match["status"]): void {
  localStorage.setItem(MATCH_KEY, JSON.stringify(
    getAllMatches().map((m) => m.id === id ? { ...m, status } : m)
  ));
}
export function deleteMatch(id: string): void {
  localStorage.setItem(MATCH_KEY, JSON.stringify(getAllMatches().filter((m) => m.id !== id)));
}
