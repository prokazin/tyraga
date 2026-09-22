import { DurableObject } from "cloudflare:workers";

interface Member {
  characterId: string;
  nickname: string;
  role: string;
}

interface ChatMessage {
  id: string;
  characterId: string;
  nickname: string;
  text: string;
  ts: number;
}

interface ClientMsg {
  type: "send";
  characterId: string;
  nickname: string;
  text: string;
}

const HISTORY_KEY = "history";
const MAX_HISTORY = 200;

export class BrigadeRoom extends DurableObject {
  private members: Map<string, Member> = new Map();
  private sessions: Set<WebSocket> = new Set();
  private history: ChatMessage[] = [];
  private loaded = false;

  async fetch(request: Request): Promise<Response> {
    await this.load();

    const url = new URL(request.url);

    if (request.headers.get("upgrade")?.toLowerCase() === "websocket") {
      return this.handleWebSocket();
    }

    if (url.pathname === "/join" && request.method === "POST") {
      const body = (await request.json()) as Member;
      this.members.set(body.characterId, body);
      this.broadcast({ type: "members", members: [...this.members.values()] });
      return this.json({ members: [...this.members.values()] });
    }

    if (url.pathname === "/leave" && request.method === "POST") {
      const body = (await request.json()) as { characterId: string };
      this.members.delete(body.characterId);
      this.broadcast({ type: "members", members: [...this.members.values()] });
      return this.json({ members: [...this.members.values()] });
    }

    if (url.pathname === "/members" && request.method === "GET") {
      return this.json({ members: [...this.members.values()] });
    }

    if (url.pathname === "/messages" && request.method === "GET") {
      return this.json({ messages: this.history });
    }

    if (url.pathname === "/messages" && request.method === "POST") {
      const body = (await request.json()) as ClientMsg;
      const msg = this.appendMessage(body);
      this.broadcast({ type: "message", message: msg });
      return this.json({ message: msg });
    }

    return this.json({ error: "not_found" }, 404);
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    const stored = await this.ctx.storage.get<ChatMessage[]>(HISTORY_KEY);
    this.history = stored ?? [];
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await this.ctx.storage.put(HISTORY_KEY, this.history);
  }

  private appendMessage(input: ClientMsg): ChatMessage {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      characterId: input.characterId,
      nickname: input.nickname,
      text: input.text.slice(0, 500),
      ts: Date.now()
    };
    this.history.push(msg);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }
    void this.persist();
    return msg;
  }

  private broadcast(payload: unknown): void {
    const text = JSON.stringify(payload);
    for (const ws of this.sessions) {
      try {
        ws.send(text);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }

  private async handleWebSocket(): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sessions.add(server);

    server.send(JSON.stringify({ type: "history", messages: this.history }));

    server.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data as string) as ClientMsg;
        if (data.type === "send") {
          const msg = this.appendMessage(data);
          this.broadcast({ type: "message", message: msg });
        }
      } catch {
        /* ignore */
      }
    });

    const close = () => {
      this.sessions.delete(server);
    };
    server.addEventListener("close", close);
    server.addEventListener("error", close);

    return new Response(null, { status: 101, webSocket: client });
  }

  private json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}
