import { defaultEnergyMax } from "@zona/core";
import type { Character } from "@zona/core";
import type { CharacterRow, UserRow } from "@zona/db";
import { rowToCharacter } from "@zona/db";
import type { Env } from "./env.js";

export interface AuthContext {
  user: UserRow;
  character: Character;
}

interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
}

export async function authenticate(
  request: Request,
  env: Env
): Promise<AuthContext | null> {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("tma ")) return null;

  const initData = header.slice(4).trim();
  if (!initData) return null;

  const tgUser = await validateInitData(initData, env.BOT_TOKEN);
  if (!tgUser) return null;

  const now = Date.now();
  let user = await env.DB
    .prepare("SELECT * FROM users WHERE telegram_id = ?")
    .bind(tgUser.id)
    .first<UserRow>();

  if (!user) {
    const id = crypto.randomUUID();
    await env.DB
      .prepare(
        "INSERT INTO users (id, telegram_id, username, first_name, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(id, tgUser.id, tgUser.username ?? null, tgUser.first_name ?? null, now)
      .run();
    user = {
      id,
      telegram_id: tgUser.id,
      username: tgUser.username ?? null,
      first_name: tgUser.first_name ?? null,
      created_at: now
    };
  }

  let row = await env.DB
    .prepare("SELECT * FROM characters WHERE user_id = ?")
    .bind(user.id)
    .first<CharacterRow>();

  if (!row) {
    const id = crypto.randomUUID();
    const nickname = tgUser.first_name ?? tgUser.username ?? "Безымянный";
    const energyMax = defaultEnergyMax();
    await env.DB
      .prepare(
        `INSERT INTO characters
           (id, user_id, nickname, authority, chips, energy, energy_max,
            skill_strength, skill_cunning, skill_charisma, skill_tech,
            skill_xp_json, brigade_id, role, last_energy_at, created_at)
         VALUES (?, ?, ?, 0, 0, ?, ?, 0, 0, 0, 0, '{}', NULL, NULL, ?, ?)`
      )
      .bind(id, user.id, nickname, energyMax, energyMax, now, now)
      .run();

    row = await env.DB
      .prepare("SELECT * FROM characters WHERE id = ?")
      .bind(id)
      .first<CharacterRow>();
  }

  if (!row) return null;

  return { user, character: rowToCharacter(row) };
}

async function validateInitData(
  initData: string,
  botToken: string
): Promise<TgUser | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const botKeyBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(botToken));
  const dataKey = await crypto.subtle.importKey(
    "raw",
    botKeyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", dataKey, encoder.encode(dataCheckString));
  const hex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex !== hash) return null;

  const userJson = params.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as TgUser;
  } catch {
    return null;
  }
}
