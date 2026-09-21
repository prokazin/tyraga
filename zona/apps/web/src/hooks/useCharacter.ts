import { useCallback, useEffect, useState } from "react";
import type { Character, Rank } from "../api.js";
import { api } from "../api.js";

export interface CharacterState {
  character: Character | null;
  rank: Rank | null;
  nextRank: Rank | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setCharacter: (c: Character) => void;
}

export function useCharacter(): CharacterState {
  const [character, setCharacterState] = useState<Character | null>(null);
  const [rank, setRank] = useState<Rank | null>(null);
  const [nextRank, setNextRank] = useState<Rank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.character();
      setCharacterState(data.character);
      setRank(data.rank);
      setNextRank(data.nextRank);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }, []);

  const setCharacter = useCallback((c: Character) => {
    setCharacterState(c);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { character, rank, nextRank, loading, error, reload, setCharacter };
}
