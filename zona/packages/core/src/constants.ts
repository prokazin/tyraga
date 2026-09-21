import type { MoveDefinition, MoveKey, RankKey, RoleKey, SkillKey } from "./types.js";

export const SKILLS: SkillKey[] = ["strength", "cunning", "charisma", "tech"];

export const ROLES: RoleKey[] = ["overseer", "mechanic", "dealer", "six"];

export const ROLE_TITLES: Record<RoleKey, string> = {
  overseer: "Смотрящий",
  mechanic: "Механик",
  dealer: "Барыга",
  six: "Шестёрка"
};

export const RANK_TITLES: Record<RankKey, string> = {
  six: "Шестёрка",
  muzhik: "Мужик",
  blatnoy: "Блатной",
  avtoritet: "Авторитет",
  smotryashiy: "Смотрящий",
  thief_in_law: "Вор в законе"
};

export const ENERGY_MAX_DEFAULT = 100;
export const ENERGY_REGEN_PER_MINUTE = 1;
export const BRIGADE_MAX_MEMBERS = 8;

export const MOVES: Record<MoveKey, MoveDefinition> = {
  carve_toy: {
    key: "carve_toy",
    title: "Слепить фигурку",
    description: "Из мякиша. Мелочь, а авторитет капает.",
    durationSec: 60,
    energyCost: 5,
    skill: "cunning",
    minSkill: 0,
    rewardAuthority: 2,
    rewardChips: 1,
    rewardSkillXp: 1
  },
  sweep_yard: {
    key: "sweep_yard",
    title: "Подмести двор",
    description: "Работа для шестёрки. Тихо и без риска.",
    durationSec: 180,
    energyCost: 8,
    skill: "strength",
    minSkill: 0,
    rewardAuthority: 4,
    rewardChips: 2,
    rewardSkillXp: 2
  },
  kitchen_duty: {
    key: "kitchen_duty",
    title: "Дежурство на кухне",
    description: "Раздача баланды. Зато при своих.",
    durationSec: 300,
    energyCost: 10,
    skill: "strength",
    minSkill: 1,
    rewardAuthority: 6,
    rewardChips: 3,
    rewardSkillXp: 2
  },
  laundry: {
    key: "laundry",
    title: "Стирка",
    description: "Чужие вещи, свои деньги.",
    durationSec: 420,
    energyCost: 11,
    skill: "cunning",
    minSkill: 2,
    rewardAuthority: 7,
    rewardChips: 4,
    rewardSkillXp: 3
  },
  smuggle_bread: {
    key: "smuggle_bread",
    title: "Протащить хлеб",
    description: "Через столовую. Главное — не спалиться.",
    durationSec: 300,
    energyCost: 12,
    skill: "cunning",
    minSkill: 3,
    rewardAuthority: 8,
    rewardChips: 5,
    rewardSkillXp: 3
  },
  gym_session: {
    key: "gym_session",
    title: "Качать бицуху",
    description: "В спортзале, с другом — веселее.",
    durationSec: 600,
    energyCost: 15,
    skill: "strength",
    minSkill: 5,
    rewardAuthority: 12,
    rewardChips: 3,
    rewardSkillXp: 5
  },
  card_game: {
    key: "card_game",
    title: "Игра в карты",
    description: "На интерес. Кто кого обует.",
    durationSec: 900,
    energyCost: 18,
    skill: "charisma",
    minSkill: 8,
    rewardAuthority: 20,
    rewardChips: 15,
    rewardSkillXp: 6
  },
  info_sell: {
    key: "info_sell",
    title: "Продать информацию",
    description: "Слухи дороже хлеба.",
    durationSec: 900,
    energyCost: 16,
    skill: "cunning",
    minSkill: 10,
    rewardAuthority: 18,
    rewardChips: 12,
    rewardSkillXp: 6
  },
  wire_radio: {
    key: "wire_radio",
    title: "Починить радио",
    description: "Механик всегда в цене.",
    durationSec: 1200,
    energyCost: 20,
    skill: "tech",
    minSkill: 10,
    rewardAuthority: 25,
    rewardChips: 20,
    rewardSkillXp: 8
  },
  tattoo: {
    key: "tattoo",
    title: "Набить наколку",
    description: "Искусство, которое остаётся навсегда.",
    durationSec: 1500,
    energyCost: 20,
    skill: "charisma",
    minSkill: 12,
    rewardAuthority: 30,
    rewardChips: 5,
    rewardSkillXp: 9
  },
  fight_club: {
    key: "fight_club",
    title: "Подпольные бои",
    description: "Кулак — лучший аргумент.",
    durationSec: 1800,
    energyCost: 25,
    skill: "strength",
    minSkill: 15,
    rewardAuthority: 40,
    rewardChips: 25,
    rewardSkillXp: 10
  }
};

export const MOVES_LIST: MoveDefinition[] = Object.values(MOVES);
