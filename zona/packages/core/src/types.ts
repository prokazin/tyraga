export type SkillKey = "strength" | "cunning" | "charisma" | "tech";

export type RoleKey = "overseer" | "mechanic" | "dealer" | "six";

export type RankKey =
  | "six"
  | "muzhik"
  | "blatnoy"
  | "avtoritet"
  | "smotryashiy"
  | "thief_in_law";

export type MoveKey =
  | "carve_toy"
  | "sweep_yard"
  | "kitchen_duty"
  | "laundry"
  | "smuggle_bread"
  | "gym_session"
  | "card_game"
  | "info_sell"
  | "wire_radio"
  | "tattoo"
  | "fight_club";

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
  skills: Record<SkillKey, SkillState>;
  brigadeId: string | null;
  role: RoleKey | null;
  lastEnergyAt: number;
  createdAt: number;
}

export interface Brigade {
  id: string;
  name: string;
  overseerId: string;
  createdAt: number;
}

export interface MoveDefinition {
  key: MoveKey;
  title: string;
  description: string;
  durationSec: number;
  energyCost: number;
  skill: SkillKey;
  minSkill: number;
  rewardAuthority: number;
  rewardChips: number;
  rewardSkillXp: number;
}

export interface ActiveMove {
  id: string;
  characterId: string;
  moveKey: MoveKey;
  startedAt: number;
  finishesAt: number;
  resolved: boolean;
}
