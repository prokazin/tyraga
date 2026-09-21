import type { Character, RoleKey, SkillKey, SkillState } from "@zona/core";

export interface UserRow {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  created_at: number;
}

export interface CharacterRow {
  id: string;
  user_id: string;
  nickname: string;
  authority: number;
  chips: number;
  energy: number;
  energy_max: number;
  skill_strength: number;
  skill_cunning: number;
  skill_charisma: number;
  skill_tech: number;
  skill_xp_json: string;
  brigade_id: string | null;
  role: string | null;
  last_energy_at: number;
  created_at: number;
}

export interface BrigadeRow {
  id: string;
  name: string;
  overseer_id: string;
  created_at: number;
}

export interface ActiveMoveRow {
  id: string;
  character_id: string;
  move_key: string;
  started_at: number;
  finishes_at: number;
  resolved: number;
  notified: number;
}

type XpMap = Partial<Record<SkillKey, number>>;

export function rowToCharacter(row: CharacterRow): Character {
  let xpMap: XpMap = {};
  try {
    xpMap = JSON.parse(row.skill_xp_json) as XpMap;
  } catch {
    xpMap = {};
  }

  const skill = (level: number, key: SkillKey): SkillState => ({
    level,
    xp: xpMap[key] ?? 0
  });

  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    authority: row.authority,
    chips: row.chips,
    energy: row.energy,
    energyMax: row.energy_max,
    skills: {
      strength: skill(row.skill_strength, "strength"),
      cunning: skill(row.skill_cunning, "cunning"),
      charisma: skill(row.skill_charisma, "charisma"),
      tech: skill(row.skill_tech, "tech")
    },
    brigadeId: row.brigade_id,
    role: (row.role as RoleKey | null) ?? null,
    lastEnergyAt: row.last_energy_at,
    createdAt: row.created_at
  };
}

export function characterToXpJson(character: Character): string {
  const map: XpMap = {
    strength: character.skills.strength.xp,
    cunning: character.skills.cunning.xp,
    charisma: character.skills.charisma.xp,
    tech: character.skills.tech.xp
  };
  return JSON.stringify(map);
}
