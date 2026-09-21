import { useCallback, useEffect, useState } from "react";
import { Panel } from "@zona/ui";
import type { ActiveMove, Character, MoveReward, MoveWithAvailability } from "../api.js";
import { api } from "../api.js";
import { MoveCard } from "../components/MoveCard.js";
import { Timer } from "../components/Timer.js";

interface MovesScreenProps {
  onCharacterChange: (c: Character) => void;
}

export function MovesScreen({ onCharacterChange }: MovesScreenProps) {
  const [moves, setMoves] = useState<MoveWithAvailability[]>([]);
  const [active, setActive] = useState<ActiveMove | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const refreshAvailable = useCallback(async () => {
    try {
      const data = await api.movesAvailable();
      setMoves(data.moves);
      onCharacterChange(data.character);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setInitialLoading(false);
    }
  }, [onCharacterChange]);

  const refreshActive = useCallback(async () => {
    try {
      const data = await api.activeMove();
      setActive(data.move);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    }
  }, []);

  useEffect(() => {
    void refreshAvailable();
    void refreshActive();
  }, [refreshAvailable, refreshActive]);

  const start = async (moveKey: string) => {
    setBusy(moveKey);
    setError(null);
    setStatus(null);
    try {
      const data = await api.startMove(moveKey);
      setActive(data.move);
      await refreshAvailable();
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setBusy(null);
    }
  };

  const claim = useCallback(async () => {
    setBusy("claim");
    setError(null);
    setStatus(null);
    try {
      const data = await api.claimMove();
      onCharacterChange(data.character);
      setActive(null);
      setStatus(formatReward(data.reward));
      await refreshAvailable();
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setBusy(null);
    }
  }, [onCharacterChange, refreshAvailable]);

  const onTimerDone = useCallback(() => {
    void claim();
  }, [claim]);

  const activeMove = active ? moves.find((m) => m.key === active.moveKey) : null;

  return (
    <>
      {active && (
        <div className="active-banner">
          <div className="active-label">В деле</div>
          <div className="active-title">{activeMove?.title ?? active.moveKey}</div>
          <Timer finishesAt={active.finishesAt} onDone={onTimerDone} />
        </div>
      )}

      {status && <div className="status">✓ {status}</div>}
      {error && <div className="error">✕ {error}</div>}

      {initialLoading ? (
        <Panel title="Движухи">
          <div className="loading">
            <div className="spinner" />
            Загрузка…
          </div>
        </Panel>
      ) : (
        <Panel title="Движухи">
          {moves.map((move) => (
            <MoveCard
              key={move.key}
              move={move}
              busy={busy === move.key || active !== null}
              onStart={start}
            />
          ))}
        </Panel>
      )}
    </>
  );
}

function formatReward(reward: MoveReward): string {
  const parts = [`+${reward.authority} авторитета`, `+${reward.chips} чипов`];
  if (reward.newLevel > reward.oldLevel) {
    parts.push(`навык повышен до ${reward.newLevel}`);
  }
  return parts.join(" · ");
}
