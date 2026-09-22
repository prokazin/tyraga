import { getNextRank, getRank, regenEnergy } from "@zona/core";
import type { AuthContext } from "../auth.js";
import { json } from "../response.js";

export function handleCharacter(
  request: Request,
  auth: AuthContext,
  url: URL
): Response {
  if (url.pathname !== "/api/character") {
    return json({ error: "not_found" }, 404);
  }
  if (request.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const now = Date.now();
  const character = {
    ...auth.character,
    energy: regenEnergy(auth.character, now)
  };

  return json({
    character,
    rank: getRank(character.authority),
    nextRank: getNextRank(character.authority)
  });
}
