import { handleCommand } from "./commands.js";
import type { Env } from "./env.js";
import type { TelegramUpdate } from "./telegram.js";
import { setWebhook } from "./telegram.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/setup") {
      const base = `${url.protocol}//${url.host}/`;
      const result = await setWebhook(env.BOT_TOKEN, base);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" }
      });
    }

    if (request.method !== "POST") {
      return new Response("ok");
    }

    let update: TelegramUpdate;
    try {
      update = (await request.json()) as TelegramUpdate;
    } catch {
      return new Response("ok");
    }

    const message = update.message;
    if (message && message.text) {
      await handleCommand(message, env);
    }

    return new Response("ok");
  }
};
