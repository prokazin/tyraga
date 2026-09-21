import { getInitData } from "./telegram.js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = getInitData();
  const headers = new Headers(init?.headers);
  headers.set("authorization", `tma ${initData}`);
  if (init?.body) headers.set("content-type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `http_${res.status}`);
  }
  return data;
}

export interface SkillState {
  level: number;
  xp: number;
}

export interface Character {
  id: string;
  userId: string;
  nickname: string;
  authority: number;
  chips: number;
  energy: number;
  energyMax: number;
  skills: Record<"strength" | "cunning" | "charisma" | "tech", SkillState>;
  brigadeId: string | null;
  role: string | null;
  lastEnergyAt: number;
  createdAt: number;
}

export interface MoveDefinition {
  key: string;
  title: string;
  description: string;
  durationSec: number;
  energyCost: number;
  skill: "strength" | "cunning" | "charisma" | "tech";
  minSkill: number;
  rewardAuthority: number;
  rewardChips: number;
  rewardSkillXp: number;
}

export interface MoveWithAvailability extends MoveDefinition {
  canStart: boolean;
}

export interface ActiveMove {
  id: string;
  characterId: string;
  moveKey: string;
  startedAt: number;
  finishesAt: number;
  resolved: boolean;
}

export interface Rank {
  key: string;
  title: string;
  minAuthority: number;
}

export interface MoveReward {
  authority: number;
  chips: number;
  skillXp: number;
  skill: string;
  oldLevel: number;
  newLevel: number;
}

export interface BrigadeInfo {
  id: string;
  name: string;
  overseerId: string;
  createdAt: number;
}

export interface BrigadeMember {
  id: string;
  nickname: string;
  role: string | null;
}

export const api = {
  character: () =>
    request<{ character: Character; rank: Rank; nextRank: Rank | null }>(
      "/api/character"
    ),

  movesAvailable: () =>
    request<{ moves: MoveWithAvailability[]; character: Character }>(
      "/api/moves/available"
    ),

  activeMove: () =>
    request<{ move: ActiveMove | null }>("/api/moves/active"),

  startMove: (moveKey: string) =>
    request<{ move: ActiveMove }>("/api/moves/start", {
      method: "POST",
      body: JSON.stringify({ moveKey })
    }),

  claimMove: () =>
    request<{ reward: MoveReward; character: Character }>("/api/moves/claim", {
      method: "POST"
    }),

  myBrigade: () =>
    request<{ brigade: BrigadeInfo | null; members: BrigadeMember[] }>(
      "/api/brigades/my"
    ),

  createBrigade: (name: string) =>
    request<{ brigade: BrigadeInfo }>("/api/brigades/create", {
      method: "POST",
      body: JSON.stringify({ name })
    }),

  joinBrigade: (brigadeId: string) =>
    request<{ brigade: BrigadeInfo }>("/api/brigades/join", {
      method: "POST",
      body: JSON.stringify({ brigadeId })
    }),

  leaveBrigade: () =>
    request<{ ok: true }>("/api/brigades/leave", { method: "POST" })
};
