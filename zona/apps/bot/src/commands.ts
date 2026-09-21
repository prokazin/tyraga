import type { Env } from "./env.js";
import type { TelegramMessage } from "./telegram.js";
import { openAppKeyboard, sendMessage } from "./telegram.js";

export async function handleCommand(
  message: TelegramMessage,
  env: Env
): Promise<void> {
  const text = message.text ?? "";
  const chatId = message.chat.id;

  const [commandRaw] = text.split(/\s+/, 1);
  const command = (commandRaw ?? "").split("@")[0] ?? "";

  switch (command) {
    case "/start":
      return start(chatId, env);
    case "/help":
      return help(chatId, env);
    case "/brigade":
      return brigade(chatId, env);
    default:
      return;
  }
}

async function start(chatId: number, env: Env): Promise<void> {
  await sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text:
      "Добро пожаловать в Zona.\n\n" +
      "Ты попал в закрытую систему. Здесь ценят авторитет, а не слова.\n\n" +
      "Открой приложение, чтобы начать.",
    reply_markup: openAppKeyboard(env.WEBAPP_URL)
  });
}

async function help(chatId: number, env: Env): Promise<void> {
  await sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text:
      "Команды:\n" +
      "/start — открыть приложение\n" +
      "/help — список команд\n" +
      "/brigade — бригада и чат\n\n" +
      "Уведомления о завершении движух приходят автоматически.",
    reply_markup: openAppKeyboard(env.WEBAPP_URL)
  });
}

async function brigade(chatId: number, env: Env): Promise<void> {
  await sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text: "Открой приложение и зайди во вкладку «Бригада».",
    reply_markup: openAppKeyboard(env.WEBAPP_URL)
  });
}
