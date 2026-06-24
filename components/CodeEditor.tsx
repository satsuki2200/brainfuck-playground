"use client";

import { useEffect, useRef } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  highlightIndex: number | null;
  disabled?: boolean;
}

const BF_COMMANDS = new Set([">", "<", "+", "-", ".", ",", "[", "]"]);

export default function CodeEditor({
  code,
  onChange,
  highlightIndex,
  disabled,
}: CodeEditorProps) {
  const activeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [highlightIndex]);

  if (highlightIndex !== null) {
    const before = code.slice(0, highlightIndex);
    const current = code[highlightIndex] ?? "";
    const after = code.slice(highlightIndex + 1);
    return (
      <div className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 min-h-[200px] max-h-64 overflow-auto font-mono text-sm whitespace-pre-wrap break-all text-zinc-300 leading-relaxed">
        <span>{before}</span>
        <span
          ref={activeRef}
          className={`rounded px-0.5 ${
            BF_COMMANDS.has(current)
              ? "bg-emerald-500 text-black font-bold"
              : "bg-zinc-600"
          }`}
        >
          {current || " "}
        </span>
        <span>{after}</span>
      </div>
    );
  }

  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={10}
      spellCheck={false}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-sm text-zinc-300 resize-none outline-none focus:border-emerald-500 transition-colors caret-emerald-400 leading-relaxed"
      placeholder="> < + - . , [ ]  Brainfuckコードをここに入力..."
    />
  );
}
