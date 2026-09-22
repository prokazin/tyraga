import { BRIGADE_MAX_MEMBERS, canCreateBrigade, canJoinBrigade } from "@zona/core";
import type { BrigadeRow } from "@zona/db";
import type { AuthContext } from "../auth.js";
import type { Env } from "../env.js";
import { error, json } from "../response.js";

export async function handleBrigades(
  request: Request,
  env: Env,
  auth: AuthContext,
  url: URL
): Promise<Response> {
  const path = url.pathname;

  if (path === "/api/brigades/my" && request.method === "GET") {
    return my(env, auth);
  }
  if (path === "/api/brigades/create" && request.method === "POST") {
    return create(request, env, auth);
  }
  if (path === "/api/brigades/join" && request.method === "POST") {
    return join(request, env, auth);
  }
  if (path === "/api/brigades/leave" && request.method === "POST") {
    return leave(env, auth);
  }

  return error("not_found", 404);
}

async function my(env: Env, auth: AuthContext): Promise<Response> {
  if (!auth.character.brigadeId) {
    return json({ brigade: null, members: [] });
  }

  const brigade = await env.DB
    .prepare("SELECT * FROM brigades WHERE id = ?")
    .bind(auth.character.brigadeId)
    .first<BrigadeRow>();

  if (!brigade) {
    return json({ brigade: null, members: [] });
  }

  const members = await env.DB
    .prepare(
      "SELECT id, nickname, role FROM characters WHERE brigade_id = ? ORDER BY created_at ASC"
    )
    .bind(brigade.id)
    .all<{ id: string; nickname: string; role: string | null }>();

  return json({
    brigade: {
      id: brigade.id,
      name: brigade.name,
      overseerId: brigade.overseer_id,
      createdAt: brigade.created_at
    },
    members: members.results
  });
}

async function create(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  const check = canCreateBrigade(auth.character);
  if (!check.ok) return error(check.reason, 400);

  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return error("invalid_json", 400);
  }

  const name = (body.name ?? "").trim();
  if (name.length < 3 || name.length > 32) return error("invalid_name", 400);

  const existing = await env.DB
    .prepare("SELECT id FROM brigades WHERE name = ?")
    .bind(name)
    .first<{ id: string }>();
  if (existing) return error("name_taken", 409);

  const now = Date.now();
  const brigadeId = crypto.randomUUID();

  await env.DB.batch([
    env.DB
      .prepare(
        "INSERT INTO brigades (id, name, overseer_id, created_at) VALUES (?, ?, ?, ?)"
      )
      .bind(brigadeId, name, auth.character.id, now),
    env.DB
      .prepare("UPDATE characters SET brigade_id = ?, role = ? WHERE id = ?")
      .bind(brigadeId, "overseer", auth.character.id)
  ]);

  return json({
    brigade: {
      id: brigadeId,
      name,
      overseerId: auth.character.id,
      createdAt: now
    }
  });
}

async function join(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  let body: { brigadeId?: string };
  try {
    body = (await request.json()) as { brigadeId?: string };
  } catch {
    return error("invalid_json", 400);
  }

  const brigadeId = body.brigadeId;
  if (!brigadeId) return error("brigadeId_required", 400);

  const brigade = await env.DB
    .prepare("SELECT * FROM brigades WHERE id = ?")
    .bind(brigadeId)
    .first<BrigadeRow>();
  if (!brigade) return error("brigade_not_found", 404);

  const countRow = await env.DB
    .prepare("SELECT COUNT(*) as count FROM characters WHERE brigade_id = ?")
    .bind(brigadeId)
    .first<{ count: number }>();
  const memberCount = countRow?.count ?? 0;

  const check = canJoinBrigade(auth.character, memberCount);
  if (!check.ok) return error(check.reason, 400);

  await env.DB
    .prepare("UPDATE characters SET brigade_id = ?, role = ? WHERE id = ?")
    .bind(brigadeId, "six", auth.character.id)
    .run();

  return json({
    brigade: {
      id: brigade.id,
      name: brigade.name,
      overseerId: brigade.overseer_id,
      createdAt: brigade.created_at
    },
    maxMembers: BRIGADE_MAX_MEMBERS
  });
}

async function leave(env: Env, auth: AuthContext): Promise<Response> {
  if (!auth.character.brigadeId) return error("not_in_brigade", 400);

  const brigade = await env.DB
    .prepare("SELECT * FROM brigades WHERE id = ?")
    .bind(auth.character.brigadeId)
    .first<BrigadeRow>();

  if (brigade && brigade.overseer_id === auth.character.id) {
    const others = await env.DB
      .prepare(
        "SELECT id FROM characters WHERE brigade_id = ? AND id != ? LIMIT 1"
      )
      .bind(brigade.id, auth.character.id)
      .first<{ id: string }>();

    if (others) {
      await env.DB.batch([
        env.DB
          .prepare("UPDATE brigades SET overseer_id = ? WHERE id = ?")
          .bind(others.id, brigade.id),
        env.DB
          .prepare("UPDATE characters SET role = ? WHERE id = ?")
          .bind("overseer", others.id)
      ]);
    } else {
      await env.DB.prepare("DELETE FROM brigades WHERE id = ?").bind(brigade.id).run();
    }
  }

  await env.DB
    .prepare("UPDATE characters SET brigade_id = NULL, role = NULL WHERE id = ?")
    .bind(auth.character.id)
    .run();

  return json({ ok: true });
}
