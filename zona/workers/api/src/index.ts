import { authenticate } from "./auth.js";
import type { Env } from "./env.js";
import { error, json } from "./response.js";
import { handleBrigades } from "./routes/brigades.js";
import { handleCharacter } from "./routes/character.js";
import { handleMoves } from "./routes/moves.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") return json({ ok: true });
    if (url.pathname === "/") return json({ name: "zona-api", ok: true });

    const auth = await authenticate(request, env);
    if (!auth) return error("unauthorized", 401);

    if (url.pathname === "/api/auth" && request.method === "POST") {
      return json({ character: auth.character });
    }
    if (url.pathname.startsWith("/api/character")) {
      return handleCharacter(request, auth, url);
    }
    if (url.pathname.startsWith("/api/moves")) {
      return handleMoves(request, env, auth, url);
    }
    if (url.pathname.startsWith("/api/brigades")) {
      return handleBrigades(request, env, auth, url);
    }

    return error("not_found", 404);
  }
};
