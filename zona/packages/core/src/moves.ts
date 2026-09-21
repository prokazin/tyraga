import { MOVES } from "./constants.js";
import { applySkillXp } from "./formulas.js";
import type {
  ActiveMove,
  Character,
  MoveDefinition,
  MoveKey,
  SkillKey
} from "./types.js";

export type MoveCheck =
  | { ok: true }
  | { ok: false; reason: "not_enough_energy" | "skill_too_low" };

export function canStartMove(character: Character, move: MoveDefinition): MoveCheck {
  if (character.energy < move.energyCost) {
    return { ok: false, reason: "not_enough_energy" };
  }
  const skill = character.skills[move.skill];
  if (skill.level < move.minSkill) {
    return { ok: false, reason: "skill_too_low" };
  }
  return { ok: true };
}

export function createActiveMove(
  id: string,
  character: Character,
  move: MoveDefinition,
  now: number
): ActiveMove {
  return {
    id,
    characterId: character.id,
    moveKey: move.key,
    startedAt: now,
    finishesAt: now + move.durationSec * 1000,
    resolved: false
  };
}

export interface MoveReward {
  authority: number;
  chips: number;
  skillXp: number;
  skill: SkillKey;
  oldLevel: number;
  newLevel: number;
}

export function resolveMove(
  character: Character,
  move: MoveDefinition,
  _now: number
): { reward: MoveReward; character: Character } {
  const skillState = character.skills[move.skill];
  const bonus = 1 + skillState.level * 0.02;
  const authority = Math.round(move.rewardAuthority * bonus);
  const chips = Math.round(move.rewardChips * bonus);

  const { level: newLevel, xp: newXp } = applySkillXp(
    skillState.level,
    skillState.xp,
    move.rewardSkillXp
  );

  const updated: Character = {
    ...character,
    authority: character.authority + authority,
    chips: character.chips + chips,
    skills: {
      ...character.skills,
      [move.skill]: { level: newLevel, xp: newXp }
    }
  };

  return {
    reward: {
      authority,
      chips,
      skillXp: move.rewardSkillXp,
      skill: move.skill,
      oldLevel: skillState.level,
      newLevel
    },
    character: updated
  };
}

export function getMove(key: MoveKey): MoveDefinition | undefined {
  return MOVES[key];
}
