export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface InlineKeyboardButton {
  text: string;
  web_app?: { url: string };
  url?: string;
}

export interface SendMessageOptions {
  chat_id: number;
  text: string;
  parse_mode?: "HTML" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
  disable_web_page_preview?: boolean;
}

export async function sendMessage(
  token: string,
  options: SendMessageOptions
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(options)
  });
}

export async function setWebhook(token: string, url: string): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url })
  });
  return res.json();
}

export function openAppKeyboard(webAppUrl: string): {
  inline_keyboard: InlineKeyboardButton[][];
} {
  return {
    inline_keyboard: [[{ text: "Открыть Zona", web_app: { url: webAppUrl } }]]
  };
}
