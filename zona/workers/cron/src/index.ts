import { MOVES, resolveMove } from "@zona/core";
import type { MoveKey } from "@zona/core";
import type { ActiveMoveRow, CharacterRow } from "@zona/db";
import { characterToXpJson, rowToCharacter } from "@zona/db";

interface Env {
  DB: D1Database;
  BOT_TOKEN: string;
}

interface PendingMove extends ActiveMoveRow {
  telegram_id: number;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const now = Date.now();

    const pending = await env.DB
      .prepare(
        `SELECT am.*, u.telegram_id as telegram_id
           FROM active_moves am
           JOIN characters c ON c.id = am.character_id
           JOIN users u ON u.id = c.user_id
          WHERE am.resolved = 0 AND am.finishes_at <= ?
          ORDER BY am.finishes_at ASC
          LIMIT 100`
      )
      .bind(now)
      .all<PendingMove>();

    for (const moveRow of pending.results) {
      await resolveOne(env, moveRow);
    }
  }
};

async function resolveOne(env: Env, moveRow: PendingMove): Promise<void> {
  const charRow = await env.DB
    .prepare("SELECT * FROM characters WHERE id = ?")
    .bind(moveRow.character_id)
    .first<CharacterRow>();

  if (!charRow) {
    await env.DB
      .prepare("UPDATE active_moves SET resolved = 1, notified = 1 WHERE id = ?")
      .bind(moveRow.id)
      .run();
    return;
  }

  const move = MOVES[moveRow.move_key as MoveKey];
  if (!move) {
    await env.DB
      .prepare("UPDATE active_moves SET resolved = 1, notified = 1 WHERE id = ?")
      .bind(moveRow.id)
      .run();
    return;
  }

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
      .bind(moveRow.id)
  ]);

  await notify(env, moveRow.telegram_id, move.title, reward);
}

async function notify(
  env: Env,
  chatId: number,
  moveTitle: string,
  reward: { authority: number; chips: number; newLevel: number; oldLevel: number }
): Promise<void> {
  const lines = [
    `«${moveTitle}» завершено.`,
    `+${reward.authority} авторитета, +${reward.chips} чипов.`
  ];
  if (reward.newLevel > reward.oldLevel) {
    lines.push(`Навык повышен до ${reward.newLevel}.`);
  }
  lines.push("Открой приложение, чтобы забрать награду.");

  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n")
      })
    });
  } catch {
    /* ignore */
  }
}
