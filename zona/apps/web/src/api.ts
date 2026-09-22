import {
  MOVES,
  MOVES_LIST,
  canStartMove,
  createActiveMove,
  defaultEnergyMax,
  getNextRank,
  getRank,
  regenEnergy,
  resolveMove
} from "@zona/core";
import type { Character, MoveReward, Rank } from "@zona/core";
import { getTelegram } from "./telegram.js";

const CHAR_KEY = "zona:character";
const ACTIVE_KEY = "zona:active_move";

export interface SkillState {
  level: number;
  xp: number;
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

export interface RankInfo {
  key: string;
  title: string;
  minAuthority: number;
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

type StoredMove = {
  id: string;
  characterId: string;
  moveKey: string;
  startedAt: number;
  finishesAt: number;
};

function loadCharacter(): Character | null {
  const raw = localStorage.getItem(CHAR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

function saveCharacter(c: Character): void {
  localStorage.setItem(CHAR_KEY, JSON.stringify(c));
}

function loadActive(): StoredMove | null {
  const raw = localStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredMove;
  } catch {
    return null;
  }
}

function saveActive(m: StoredMove | null): void {
  if (m === null) {
    localStorage.removeItem(ACTIVE_KEY);
  } else {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(m));
  }
}

function createInitialCharacter(): Character {
  const tg = getTelegram();
  const user = tg?.initDataUnsafe.user;
  const nickname = user?.first_name ?? user?.username ?? "Заключённый";
  const now = Date.now();
  const energyMax = defaultEnergyMax();

  const character: Character = {
    id: crypto.randomUUID(),
    userId: user ? String(user.id) : "local",
    nickname,
    authority: 0,
    chips: 0,
    energy: energyMax,
    energyMax,
    skills: {
      strength: { level: 0, xp: 0 },
      cunning: { level: 0, xp: 0 },
      charisma: { level: 0, xp: 0 },
      tech: { level: 0, xp: 0 }
    },
    brigadeId: null,
    role: null,
    lastEnergyAt: now,
    createdAt: now
  };
  saveCharacter(character);
  return character;
}

function getOrCreateCharacter(): Character {
  return loadCharacter() ?? createInitialCharacter();
}

function withRegen(c: Character): Character {
  const now = Date.now();
  const energy = regenEnergy(c, now);
  if (energy === c.energy) return c;
  const updated: Character = { ...c, energy, lastEnergyAt: now };
  saveCharacter(updated);
  return updated;
}

export const api = {
  async character(): Promise<{
    character: Character;
    rank: RankInfo;
    nextRank: RankInfo | null;
  }> {
    const character = withRegen(getOrCreateCharacter());
    const rank = getRank(character.authority) as Rank;
    const nextRank = getNextRank(character.authority) as Rank | null;
    return {
      character,
      rank: { key: rank.key, title: rank.title, minAuthority: rank.minAuthority },
      nextRank: nextRank
        ? { key: nextRank.key, title: nextRank.title, minAuthority: nextRank.minAuthority }
        : null
    };
  },

  async movesAvailable(): Promise<{
    moves: MoveWithAvailability[];
    character: Character;
  }> {
    const character = withRegen(getOrCreateCharacter());
    const moves = MOVES_LIST.map((move) => ({
      ...move,
      canStart: canStartMove(character, move).ok
    })) as MoveWithAvailability[];
    return { moves, character };
  },

  async activeMove(): Promise<{ move: ActiveMove | null }> {
    const stored = loadActive();
    if (!stored) return { move: null };
    return {
      move: {
        id: stored.id,
        characterId: stored.characterId,
        moveKey: stored.moveKey,
        startedAt: stored.startedAt,
        finishesAt: stored.finishesAt,
        resolved: false
      }
    };
  },

  async startMove(moveKey: string): Promise<{ move: ActiveMove }> {
    const character = withRegen(getOrCreateCharacter());
    const move = MOVES[moveKey as keyof typeof MOVES];
    if (!move) throw new Error("move_not_found");

    const existing = loadActive();
    if (existing) throw new Error("already_active");

    const check = canStartMove(character, move);
    if (!check.ok) throw new Error(check.reason);

    const now = Date.now();
    const active = createActiveMove(crypto.randomUUID(), character, move, now);

    const updated: Character = {
      ...character,
      energy: character.energy - move.energyCost,
      lastEnergyAt: now
    };
    saveCharacter(updated);
    saveActive({
      id: active.id,
      characterId: active.characterId,
      moveKey: active.moveKey,
      startedAt: active.startedAt,
      finishesAt: active.finishesAt
    });

    return { move: active };
  },

  async claimMove(): Promise<{ reward: MoveReward; character: Character }> {
    const stored = loadActive();
    if (!stored) throw new Error("no_active_move");
    if (stored.finishesAt > Date.now()) throw new Error("not_finished");

    const character = withRegen(getOrCreateCharacter());
    const move = MOVES[stored.moveKey as keyof typeof MOVES];
    if (!move) throw new Error("move_not_found");

    const { reward, character: updated } = resolveMove(character, move, Date.now());
    saveCharacter(updated);
    saveActive(null);

    return { reward, character: updated };
  },

  async myBrigade(): Promise<{ brigade: BrigadeInfo | null; members: BrigadeMember[] }> {
    return { brigade: null, members: [] };
  },

  async createBrigade(_name: string): Promise<{ brigade: BrigadeInfo }> {
    throw new Error("not_available");
  },

  async joinBrigade(_brigadeId: string): Promise<{ brigade: BrigadeInfo }> {
    throw new Error("not_available");
  },

  async leaveBrigade(): Promise<{ ok: true }> {
    return { ok: true };
  }
};
