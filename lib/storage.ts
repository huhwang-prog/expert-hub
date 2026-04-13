"use client";

import { Expert } from "./types";

const KEY = "expert_hub_experts";

export function getAllExperts(): Expert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function getApprovedExperts(): Expert[] {
  return getAllExperts().filter((e) => e.status === "approved");
}

export function saveExpert(expert: Expert): void {
  const experts = getAllExperts();
  experts.unshift(expert);
  localStorage.setItem(KEY, JSON.stringify(experts));
}

export function updateExpertStatus(id: string, status: Expert["status"]): void {
  const experts = getAllExperts().map((e) =>
    e.id === id ? { ...e, status } : e
  );
  localStorage.setItem(KEY, JSON.stringify(experts));
}

export function deleteExpert(id: string): void {
  const experts = getAllExperts().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(experts));
}
