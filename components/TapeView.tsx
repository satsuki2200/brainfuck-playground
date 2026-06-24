"use client";

import { useEffect, useRef } from "react";

interface TapeViewProps {
  tape: number[];
  pointer: number;
  showAscii: boolean;
}

const VISIBLE_CELLS = 41;

export default function TapeView({ tape, pointer, showAscii }: TapeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const half = Math.floor(VISIBLE_CELLS / 2);
  const start = Math.max(0, pointer - half);
  const end = Math.min(tape.length, start + VISIBLE_CELLS);
  const cells = tape.slice(start, end);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pointer]);

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {cells.map((val, i) => {
          const absIdx = start + i;
          const isActive = absIdx === pointer;
          return (
            <div
              key={absIdx}
              ref={isActive ? activeRef : undefined}
              className={`flex-shrink-0 flex flex-col items-center rounded transition-colors ${
                isActive
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
              style={{ minWidth: "2.5rem" }}
            >
              <span className="text-[10px] text-zinc-500 px-1 border-b border-zinc-700 w-full text-center">
                {absIdx}
              </span>
              <span className="font-mono text-xs py-1 font-semibold">
                {showAscii && val >= 32 && val < 127
                  ? String.fromCharCode(val)
                  : val}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        ポインタ: <span className="text-emerald-400 font-mono">{pointer}</span>
        　値: <span className="text-emerald-400 font-mono">{tape[pointer]}</span>
        {tape[pointer] >= 32 && tape[pointer] < 127 && (
          <span className="text-zinc-400">
            {" "}
            ('{String.fromCharCode(tape[pointer])}')
          </span>
        )}
      </p>
    </div>
  );
}
