import { useCallback, useEffect, useState } from "react";
import { Panel } from "@zona/ui";
import type { BrigadeInfo, BrigadeMember, Character } from "../api.js";
import { api } from "../api.js";
import { BrigadeChat } from "../components/BrigadeChat.js";
import { IconExit, IconPlus, IconUsers } from "../icons.js";

interface BrigadeScreenProps {
  character: Character | null;
  onCharacterChange: (c: Character) => void;
}

const ROLE_TITLES: Record<string, string> = {
  overseer: "Смотрящий",
  mechanic: "Механик",
  dealer: "Барыга",
  six: "Шестёрка"
};

export function BrigadeScreen({ character, onCharacterChange }: BrigadeScreenProps) {
  const [brigade, setBrigade] = useState<BrigadeInfo | null>(null);
  const [members, setMembers] = useState<BrigadeMember[]>([]);
  const [name, setName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.myBrigade();
      setBrigade(data.brigade);
      setMembers(data.members);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.createBrigade(name.trim());
      await load();
      if (character)
        onCharacterChange({ ...character, brigadeId: "self", role: "overseer" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    if (!joinId.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.joinBrigade(joinId.trim());
      await load();
      if (character)
        onCharacterChange({ ...character, brigadeId: joinId.trim(), role: "six" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.leaveBrigade();
      setBrigade(null);
      setMembers([]);
      if (character)
        onCharacterChange({ ...character, brigadeId: null, role: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setBusy(false);
    }
  };

  if (brigade) {
    return (
      <>
        <Panel title={brigade.name}>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-dim)" }}>
            Состав: {members.length}/8 · ID: {brigade.id.slice(0, 8)}
          </p>
          <ul className="members">
            {members.map((m) => (
              <li className="member" key={m.id}>
                <div className="member-avatar">
                  {m.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <div className="member-name">{m.nickname}</div>
                  <div className="member-role">
                    {m.role ? ROLE_TITLES[m.role] ?? m.role : "без роли"}
                  </div>
                </div>
                {m.role && (
                  <span className={`role-badge role-${m.role}`}>
                    {ROLE_TITLES[m.role] ?? m.role}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Бригадный чат">
          <BrigadeChat brigadeId={brigade.id} character={character} />
        </Panel>

        {error && <div className="error">✕ {error}</div>}

        <button className="btn btn-danger btn-block" disabled={busy} onClick={leave}>
          <IconExit size={14} />
          {busy ? "…" : "Покинуть бригаду"}
        </button>
      </>
    );
  }

  return (
    <>
      <Panel title="Создать бригаду">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название бригады"
          maxLength={32}
        />
        <button
          className="btn btn-primary btn-block"
          disabled={busy || name.trim().length < 3}
          onClick={create}
        >
          <IconPlus size={14} />
          {busy ? "…" : "Создать"}
        </button>
      </Panel>

      <div className="divider">или</div>

      <Panel title="Вступить в бригаду">
        <input
          className="input"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="ID бригады"
        />
        <button
          className="btn btn-primary btn-block"
          disabled={busy || joinId.trim().length === 0}
          onClick={join}
        >
          <IconUsers size={14} />
          {busy ? "…" : "Вступить"}
        </button>
      </Panel>

      {error && <div className="error">✕ {error}</div>}
    </>
  );
}
