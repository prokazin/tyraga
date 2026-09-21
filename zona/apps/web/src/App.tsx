import { useState } from "react";
import { CharacterScreen } from "./screens/CharacterScreen.js";
import { BrigadeScreen } from "./screens/BrigadeScreen.js";
import { MovesScreen } from "./screens/MovesScreen.js";
import { useCharacter } from "./hooks/useCharacter.js";
import {
  IconHammer,
  IconLogo,
  IconPerson,
  IconUsers
} from "./icons.js";

type Tab = "character" | "moves" | "brigade";

export function App() {
  const [tab, setTab] = useState<Tab>("character");
  const { character, rank, nextRank, loading, error, setCharacter } = useCharacter();

  return (
    <div className="app">
      <header className="app-header">
        <IconLogo className="app-logo" />
        <div>
          <h1 className="app-title">Zona</h1>
          <p className="app-subtitle">
            {character ? character.nickname : "Загрузка…"}
            {rank ? ` · ${rank.title}` : ""}
          </p>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "character" ? "active" : ""}`}
          onClick={() => setTab("character")}
        >
          <IconPerson /> Персонаж
        </button>
        <button
          className={`tab ${tab === "moves" ? "active" : ""}`}
          onClick={() => setTab("moves")}
        >
          <IconHammer /> Движухи
        </button>
        <button
          className={`tab ${tab === "brigade" ? "active" : ""}`}
          onClick={() => setTab("brigade")}
        >
          <IconUsers /> Бригада
        </button>
      </nav>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          Загрузка…
        </div>
      )}

      {error && !loading && <div className="error">Ошибка: {error}</div>}

      {!loading && !error && tab === "character" && (
        <CharacterScreen character={character} rank={rank} nextRank={nextRank} />
      )}

      {!loading && !error && tab === "moves" && (
        <MovesScreen onCharacterChange={setCharacter} />
      )}

      {!loading && !error && tab === "brigade" && (
        <BrigadeScreen character={character} onCharacterChange={setCharacter} />
      )}
    </div>
  );
}
