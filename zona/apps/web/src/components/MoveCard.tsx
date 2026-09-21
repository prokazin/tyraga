import type { MoveWithAvailability } from "../api.js";
import {
  IconCards,
  IconClock,
  IconEye,
  IconLock,
  IconMask,
  IconPlay,
  IconShield,
  IconStar,
  IconStrength,
  IconWrench
} from "../icons.js";

interface MoveCardProps {
  move: MoveWithAvailability;
  busy: boolean;
  onStart: (key: string) => void;
}

type IconCmp = (p: { size?: number }) => JSX.Element;

const SKILL_META: Record<
  string,
  { title: string; Icon: IconCmp }
> = {
  strength: { title: "Сила", Icon: IconStrength },
  cunning: { title: "Хитрость", Icon: IconEye },
  charisma: { title: "Харизма", Icon: IconMask },
  tech: { title: "Техника", Icon: IconWrench }
};

const MOVE_ICONS: Record<string, IconCmp> = {
  carve_toy: IconStar,
  sweep_yard: IconShield,
  kitchen_duty: IconStar,
  laundry: IconCards,
  smuggle_bread: IconEye,
  gym_session: IconStrength,
  card_game: IconCards,
  info_sell: IconEye,
  wire_radio: IconWrench,
  tattoo: IconMask,
  fight_club: IconStrength
};

export function MoveCard({ move, busy, onStart }: MoveCardProps) {
  const duration = `${Math.round(move.durationSec / 60)} мин`;
  const skill = SKILL_META[move.skill];
  const MoveIcon = MOVE_ICONS[move.key] ?? IconStar;
  const locked = !move.canStart;
  const SkillIcon = skill?.Icon;

  return (
    <div className={`move ${locked ? "locked" : ""}`}>
      <div className="move-top">
        <div className="move-title">
          <MoveIcon size={16} />
          {move.title}
        </div>
        <div className="move-duration">
          <IconClock size={12} /> {duration}
        </div>
      </div>

      <p className="move-desc">{move.description}</p>

      <div className="move-meta">
        <span className="chip">
          {SkillIcon ? <SkillIcon size={12} /> : null}
          {skill?.title ?? move.skill} ≥ {move.minSkill}
        </span>
        <span className="chip gold">Энергия {move.energyCost}</span>
        <span className="chip orange">Авторитет +{move.rewardAuthority}</span>
        <span className="chip green">Чипы +{move.rewardChips}</span>
      </div>

      <button
        className="btn btn-primary btn-block"
        disabled={locked || busy}
        onClick={() => onStart(move.key)}
      >
        {busy ? (
          "…"
        ) : locked ? (
          <>
            <IconLock size={14} /> Недоступно
          </>
        ) : (
          <>
            <IconPlay size={14} /> Начать
          </>
        )}
      </button>
    </div>
  );
}
