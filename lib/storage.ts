"use client";

import { Expert, Institution, Match } from "./types";

/* ─── 전문가 ─── */
export async function getAllExperts(): Promise<Expert[]> {
  const res = await fetch("/api/experts");
  return res.ok ? res.json() : [];
}
export async function getApprovedExperts(): Promise<Expert[]> {
  const list = await getAllExperts();
  return list.filter((e) => e.status === "approved");
}
export async function saveExpert(expert: Expert): Promise<void> {
  await fetch("/api/experts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(expert) });
}
export async function updateExpertStatus(id: string, status: Expert["status"]): Promise<void> {
  await fetch(`/api/experts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}
export async function deleteExpert(id: string): Promise<void> {
  await fetch(`/api/experts/${id}`, { method: "DELETE" });
}

/* ─── 기관 ─── */
export async function getAllInstitutions(): Promise<Institution[]> {
  const res = await fetch("/api/institutions");
  return res.ok ? res.json() : [];
}
export async function getApprovedInstitutions(): Promise<Institution[]> {
  const list = await getAllInstitutions();
  return list.filter((i) => i.status === "approved");
}
export async function saveInstitution(inst: Institution): Promise<void> {
  await fetch("/api/institutions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inst) });
}
export async function updateInstitution(inst: Institution): Promise<void> {
  await fetch(`/api/institutions/${inst.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inst) });
}
export async function updateInstitutionStatus(id: string, status: Institution["status"]): Promise<void> {
  await fetch(`/api/institutions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}
export async function deleteInstitution(id: string): Promise<void> {
  await fetch(`/api/institutions/${id}`, { method: "DELETE" });
}
export async function loginInstitution(email: string, password: string): Promise<Institution | null> {
  const res = await fetch("/api/institutions/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  return res.ok ? res.json() : null;
}

/* ─── 매칭 ─── */
export async function getAllMatches(): Promise<Match[]> {
  const res = await fetch("/api/matches");
  return res.ok ? res.json() : [];
}
export async function saveMatch(match: Match): Promise<void> {
  await fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(match) });
}
export async function updateMatchStatus(id: string, status: Match["status"]): Promise<void> {
  await fetch(`/api/matches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}
export async function deleteMatch(id: string): Promise<void> {
  await fetch(`/api/matches/${id}`, { method: "DELETE" });
}
