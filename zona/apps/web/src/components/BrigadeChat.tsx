import { useEffect, useRef, useState } from "react";
import type { Character } from "../api.js";
import { IconSend } from "../icons.js";

interface ChatMessage {
  id: string;
  characterId: string;
  nickname: string;
  text: string;
  ts: number;
}

interface BrigadeChatProps {
  brigadeId: string;
  character: Character | null;
}

const WS_BASE = import.meta.env.VITE_WS_BASE ?? "";

export function BrigadeChat({ brigadeId, character }: BrigadeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const url = `${WS_BASE}/?brigadeId=${encodeURIComponent(brigadeId)}&ws=1`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as
          | { type: "history"; messages: ChatMessage[] }
          | { type: "message"; message: ChatMessage };

        if (msg.type === "history") {
          setMessages(msg.messages);
        } else if (msg.type === "message") {
          setMessages((prev) => [...prev, msg.message]);
        }
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [brigadeId]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !character) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "send",
        characterId: character.id,
        nickname: character.nickname,
        text: trimmed
      })
    );
    setText("");
  };

  return (
    <div>
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && (
          <p className="chat-empty">Сообщений пока нет</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="chat-msg">
            <span className="chat-author">{m.nickname}:</span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>

      <div className="chat-row">
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={connected ? "Сообщение…" : "Подключение…"}
          disabled={!connected}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!connected || text.trim().length === 0}
        >
          <IconSend size={14} />
        </button>
      </div>
    </div>
  );
}
