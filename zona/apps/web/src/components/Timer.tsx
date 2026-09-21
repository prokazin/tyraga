import { useEffect, useState } from "react";
import { IconClock } from "../icons.js";

interface TimerProps {
  finishesAt: number;
  onDone?: () => void;
}

export function Timer({ finishesAt, onDone }: TimerProps) {
  const [remaining, setRemaining] = useState(Math.max(0, finishesAt - Date.now()));

  useEffect(() => {
    const tick = () => {
      const r = Math.max(0, finishesAt - Date.now());
      setRemaining(r);
      if (r <= 0 && onDone) onDone();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [finishesAt, onDone]);

  const totalSec = Math.ceil(remaining / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const done = remaining <= 0;

  return (
    <span className={`timer ${done ? "done" : ""}`}>
      <IconClock size={20} />
      {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
    </span>
  );
}
