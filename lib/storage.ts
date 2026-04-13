"use client";

import { Expert } from "./types";

const KEY = "expert_hub_experts";

export function getExperts(): Expert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveExpert(expert: Expert): void {
  const experts = getExperts();
  experts.unshift(expert);
  localStorage.setItem(KEY, JSON.stringify(experts));
}
