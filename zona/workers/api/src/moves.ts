import {
  MOVES,
  MOVES_LIST,
  canStartMove,
  createActiveMove,
  regenEnergy,
  resolveMove
} from "@zona/core";
import type { ActiveMove, CharacterRow } from "@zona/core";
import { characterToXpJson, rowToCharacter } from "@zona/db";
import type { ActiveMoveRow as DbActiveMoveRow } from "@zona/db";
import type { AuthContext } from "../auth.js";
import type { Env } from "../env.js";
import { error, json } from "../response.js";

export async function handleMoves(
  request: Request,
  env: Env,
  auth: AuthContext,
  url: URL
): Promise<Response> {
  const path = url.pathname;

  if (path === "/api/moves" && request.method === "GET") {
    return json({ moves: MOVES_LIST });
  }
  if (path === "/api/moves/available" && request.method === "GET") {
    return available(env, auth);
  }
  if (path === "/api/moves/active" && request.method === "GET") {
    return active(env, auth);
  }
  if (path === "/api/moves/start" && request.method === "POST") {
    return start(request, env, auth);
  }
  if (path === "/api/moves/claim" && request.method === "POST") {
    return claim(env, auth);
  }

  return error("not_found", 404);
}

async function available(_env: Env, auth: AuthContext): Promise<Response> {
  const now = Date.now();
  const fresh = {
    ...auth.character,
    energy: regenEnergy(auth.character, now)
  };

  const list = MOVES_LIST.map((move) => ({
    ...move,
    canStart: canStartMove(fresh, move).ok
  }));

  return json({ moves: list, character: fresh });
}

async function active(env: Env, auth: AuthContext): Promise<Response> {
  const row = await env.DB
    .prepare(
      "SELECT * FROM active_moves WHERE character_id = ? AND resolved = 0 ORDER BY finishes_at ASC LIMIT 1"
    )
    .bind(auth.character.id)
    .first<DbActiveMoveRow>();

  return json({ move: row ? rowToActive(row) : null });
}

async function start(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  let body: { moveKey?: string };
  try {
    body = (await request.json()) as { moveKey?: string };
  } catch {
    return error("invalid_json", 400);
  }

  const moveKey = body.moveKey;
  if (!moveKey) return error("moveKey_required", 400);

  const move = MOVES[moveKey as keyof typeof MOVES];
  if (!move) return error("move_not_found", 404);

  const now = Date.now();
  const freshEnergy = regenEnergy(auth.character, now);

  const existing = await env.DB
    .prepare(
      "SELECT id FROM active_moves WHERE character_id = ? AND resolved = 0 LIMIT 1"
    )
    .bind(auth.character.id)
    .first<{ id: string }>();
  if (existing) return error("already_active", 409);

  const fresh = { ...auth.character, energy: freshEnergy };
  const check = canStartMove(fresh, move);
  if (!check.ok) return error(check.reason, 400);

  const activeMove: ActiveMove = createActiveMove(
    crypto.randomUUID(),
    fresh,
    move,
    now
  );

  await env.DB.batch([
    env.DB
      .prepare("UPDATE characters SET energy = ?, last_energy_at = ? WHERE id = ?")
      .bind(freshEnergy - move.energyCost, now, fresh.id),
    env.DB
      .prepare(
        "INSERT INTO active_moves (id, character_id, move_key, started_at, finishes_at, resolved, notified) VALUES (?, ?, ?, ?, ?, 0, 0)"
      )
      .bind(
        activeMove.id,
        activeMove.characterId,
        activeMove.moveKey,
        activeMove.startedAt,
        activeMove.finishesAt
      )
  ]);

  return json({ move: activeMove });
}

async function claim(env: Env, auth: AuthContext): Promise<Response> {
  const row = await env.DB
    .prepare(
      "SELECT * FROM active_moves WHERE character_id = ? AND resolved = 0 ORDER BY finishes_at ASC LIMIT 1"
    )
    .bind(auth.character.id)
    .first<DbActiveMoveRow>();

  if (!row) return error("no_active_move", 404);
  if (row.finishes_at > Date.now()) return error("not_finished", 400);

  const move = MOVES[row.move_key as keyof typeof MOVES];
  if (!move) return error("move_not_found", 500);

  const charRow = await env.DB
    .prepare("SELECT * FROM characters WHERE id = ?")
    .bind(auth.character.id)
    .first<CharacterRow>();
  if (!charRow) return error("character_not_found", 404);

  const character = rowToCharacter(charRow);
  const { reward, character: updated } = resolveMove(character, move, Date.now());

  await env.DB.batch([
    env.DB
      .prepare(
        `UPDATE characters SET
           authority = ?,
           chips = ?,
           skill_strength = ?,
           skill_cunning = ?,
           skill_charisma = ?,
           skill_tech = ?,
           skill_xp_json = ?
         WHERE id = ?`
      )
      .bind(
        updated.authority,
        updated.chips,
        updated.skills.strength.level,
        updated.skills.cunning.level,
        updated.skills.charisma.level,
        updated.skills.tech.level,
        characterToXpJson(updated),
        updated.id
      ),
    env.DB
      .prepare("UPDATE active_moves SET resolved = 1, notified = 1 WHERE id = ?")
      .bind(row.id)
  ]);

  return json({ reward, character: updated });
}

function rowToActive(row: DbActiveMoveRow): ActiveMove {
  return {
    id: row.id,
    characterId: row.character_id,
    moveKey: row.move_key as ActiveMove["moveKey"],
    startedAt: row.started_at,
    finishesAt: row.finishes_at,
    resolved: row.resolved === 1
  };
}
