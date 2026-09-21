import { Panel, StatBar } from "@zona/ui";
import type { Character, Rank } from "../api.js";
import {
  IconEye,
  IconMask,
  IconStrength,
  IconWrench
} from "../icons.js";

interface CharacterScreenProps {
  character: Character | null;
  rank: Rank | null;
  nextRank: Rank | null;
}

type IconCmp = (p: { size?: number; className?: string }) => JSX.Element;

const SKILL_META: Record<string, { title: string; Icon: IconCmp }> = {
  strength: { title: "Сила", Icon: IconStrength },
  cunning: { title: "Хитрость", Icon: IconEye },
  charisma: { title: "Харизма", Icon: IconMask },
  tech: { title: "Техника", Icon: IconWrench }
};

export function CharacterScreen({ character, rank, nextRank }: CharacterScreenProps) {
  if (!character) {
    return (
      <Panel title="Персонаж">
        <div className="loading">
          <div className="spinner" />
          Загрузка…
        </div>
      </Panel>
    );
  }

  const authorityMax = nextRank?.minAuthority ?? rank?.minAuthority ?? 1;
  const initial = character.nickname.charAt(0).toUpperCase();

  return (
    <>
      <Panel title="Персонаж">
        <div className="char-head">
          <div className="char-avatar">{initial}</div>
          <div>
            <p className="char-name">{character.nickname}</p>
            <p className="char-rank">
              Звание: <span className="gold">{rank?.title ?? "—"}</span>
              {nextRank
                ? ` · До «${nextRank.title}»: ${nextRank.minAuthority - character.authority}`
                : " · максимальное звание"}
            </p>
          </div>
        </div>

        <StatBar label="Энергия" value={character.energy} max={character.energyMax} />
        <StatBar
          label="Авторитет"
          value={character.authority}
          max={authorityMax}
          color="#a05a2c"
        />
        <StatBar
          label="Чипы"
          value={character.chips}
          max={Math.max(100, character.chips)}
          color="#4a7a4a"
        />
      </Panel>

      <Panel title="Навыки">
        <div className="skills">
          {(["strength", "cunning", "charisma", "tech"] as const).map((key) => {
            const skill = character.skills[key];
            const meta = SKILL_META[key]!;
            const next = 10 + skill.level * 5;
            const pct = Math.min(100, (skill.xp / next) * 100);
            return (
              <div className="skill" key={key}>
                <div className="skill-head">
                  <meta.Icon size={18} className="skill-icon" />
                  <span className="skill-name">{meta.title}</span>
                  <span className="skill-level">{skill.level}</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="skill-xp">
                  {skill.xp}/{next}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
