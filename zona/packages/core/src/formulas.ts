import { ENERGY_MAX_DEFAULT, ENERGY_REGEN_PER_MINUTE } from "./constants.js";
import type { Character } from "./types.js";

export function xpForSkillLevel(level: number): number {
  return 10 + level * 5;
}

export function applySkillXp(
  currentLevel: number,
  currentXp: number,
  xpGain: number
): { level: number; xp: number } {
  let level = currentLevel;
  let xp = currentXp + xpGain;
  while (xp >= xpForSkillLevel(level)) {
    xp -= xpForSkillLevel(level);
    level += 1;
  }
  return { level, xp };
}

export function regenEnergy(character: Character, now: number): number {
  if (character.energy >= character.energyMax) return character.energyMax;
  const minutes = Math.floor((now - character.lastEnergyAt) / 60_000);
  if (minutes <= 0) return character.energy;
  const regen = minutes * ENERGY_REGEN_PER_MINUTE;
  return Math.min(character.energyMax, character.energy + regen);
}

export function defaultEnergyMax(): number {
  return ENERGY_MAX_DEFAULT;
}
