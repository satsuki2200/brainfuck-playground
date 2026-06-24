"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CodeEditor from "@/components/CodeEditor";
import TapeView from "@/components/TapeView";
import { SAMPLES } from "@/lib/samples";
import {
  BFState,
  buildJumpMap,
  createInitialState,
  stepBF,
  runBF,
} from "@/lib/brainfuck";

const DEFAULT_CODE = `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`;
const SPEED_OPTIONS = [
  { label: "x0.25", ms: 800 },
  { label: "x0.5", ms: 400 },
  { label: "x1", ms: 200 },
  { label: "x2", ms: 80 },
  { label: "x5", ms: 30 },
  { label: "x10", ms: 10 },
  { label: "x50", ms: 2 },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(() => {
    const encoded = searchParams.get("code");
    if (encoded) {
      try {
        return atob(encoded);
      } catch {
        return DEFAULT_CODE;
      }
    }
    return DEFAULT_CODE;
  });
  const [input, setInput] = useState("");
  const [state, setState] = useState<BFState | null>(null);
  const [jumpMap, setJumpMap] = useState<Map<number, number> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [showAscii, setShowAscii] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compile = useCallback(
    (src: string, userInput: string) => {
      const filtered = src.replace(/[^><+\-.,[\]]/g, "");
      const jm = buildJumpMap(filtered);
      if (typeof jm === "string") {
        setParseError(jm);
        setJumpMap(null);
        setState(null);
        return null;
      }
      setParseError(null);
      setJumpMap(jm);
      const s = createInitialState(userInput);
      setState(s);
      return { jm, s };
    },
    []
  );

  const handleRun = () => {
    setIsAutoPlaying(false);
    const result = compile(code, input);
    if (!result) return;
    const { jm, s } = result;
    const filtered = code.replace(/[^><+\-.,[\]]/g, "");
    const finalState = runBF({ ...s, status: "running" }, filtered, jm);
    setState(finalState);
    setJumpMap(jm);
  };

  const getFilteredCode = (src: string) => src.replace(/[^><+\-.,[\]]/g, "");

  const handleStep = () => {
    setIsAutoPlaying(false);
    if (!state || !jumpMap) {
      const result = compile(code, input);
      if (!result) return;
      const { jm, s } = result;
      const filtered = getFilteredCode(code);
      const next = stepBF({ ...s, status: "paused" }, filtered, jm);
      setState(next);
      return;
    }
    const filtered = getFilteredCode(code);
    const next = stepBF(state, filtered, jumpMap);
    setState(next);
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }
    if (!state || state.status === "done" || state.status === "error") {
      const result = compile(code, input);
      if (!result) return;
      setIsAutoPlaying(true);
      return;
    }
    if (!jumpMap) return;
    setIsAutoPlaying(true);
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    setState(null);
    setJumpMap(null);
    setParseError(null);
  };

  // Auto-play loop
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      return;
    }

    const tick = () => {
      setState((prev) => {
        if (!prev || !jumpMap) return prev;
        if (prev.status === "done" || prev.status === "error") {
          setIsAutoPlaying(false);
          return prev;
        }
        const filtered = getFilteredCode(code);
        const next = stepBF(prev, filtered, jumpMap);
        if (next.status === "done" || next.status === "error") {
          setIsAutoPlaying(false);
        }
        return next;
      });
      autoPlayRef.current = setTimeout(tick, SPEED_OPTIONS[speedIdx].ms);
    };

    autoPlayRef.current = setTimeout(tick, SPEED_OPTIONS[speedIdx].ms);
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [isAutoPlaying, jumpMap, code, speedIdx]);

  const handleSampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (isNaN(idx)) return;
    const sample = SAMPLES[idx];
    setCode(sample.code);
    setInput(sample.input ?? "");
    handleReset();
  };

  const handleShare = () => {
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg("URLをコピーしました！");
      setTimeout(() => setShareMsg(""), 2000);
    });
  };

  const filtered = getFilteredCode(code);

  const mapFilteredToOriginal = (filtIdx: number | null): number | null => {
    if (filtIdx === null) return null;
    let count = 0;
    for (let i = 0; i < code.length; i++) {
      if (/[><+\-.,[\]]/.test(code[i])) {
        if (count === filtIdx) return i;
        count++;
      }
    }
    return null;
  };

  const origHighlight = mapFilteredToOriginal(
    state?.status === "paused" ? state.instrPointer : null
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-emerald-400">[&gt;_]</span>
          <h1 className="font-mono font-semibold text-zinc-100">Brainfuck Playground</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tutorial" className="text-zinc-400 hover:text-emerald-400 transition-colors">
            チュートリアル
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Sample selector + share */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            onChange={handleSampleSelect}
            defaultValue=""
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300 outline-none focus:border-emerald-500"
          >
            <option value="" disabled>サンプルを選択...</option>
            {SAMPLES.map((s, i) => (
              <option key={i} value={i}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={handleShare}
            className="ml-auto px-3 py-1.5 text-sm rounded border border-zinc-700 hover:border-emerald-500 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            共有URLをコピー
          </button>
          {shareMsg && <span className="text-xs text-emerald-400">{shareMsg}</span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: editor + controls */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">コード</label>
              <CodeEditor
                code={code}
                onChange={(v) => { setCode(v); handleReset(); }}
                highlightIndex={origHighlight}
                disabled={isAutoPlaying}
              />
              {parseError && (
                <p className="text-xs text-red-400 mt-1">{parseError}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRun}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-sm transition-colors"
              >
                ▶ 実行
              </button>
              <button
                onClick={handleStep}
                disabled={state?.status === "done" || state?.status === "error"}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 rounded font-mono text-sm transition-colors"
              >
                ⏩ ステップ
              </button>
              <button
                onClick={handleAutoPlay}
                disabled={state?.status === "done" || state?.status === "error"}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  isAutoPlaying
                    ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200"
                }`}
              >
                {isAutoPlaying ? "⏸ 一時停止" : "▶▶ 自動再生"}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded font-mono text-sm transition-colors"
              >
                ↺ リセット
              </button>

              {/* Speed */}
              <div className="flex items-center gap-1 ml-auto text-xs text-zinc-500">
                <span>速度:</span>
                {SPEED_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSpeedIdx(i)}
                    className={`px-2 py-1 rounded font-mono transition-colors ${
                      speedIdx === i
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            {state && (
              <div className="text-xs text-zinc-500 font-mono">
                {state.status === "done" && <span className="text-emerald-400">✓ 完了 ({state.steps.toLocaleString()} ステップ)</span>}
                {state.status === "error" && <span className="text-red-400">✗ エラー: {state.errorMessage}</span>}
                {state.status === "paused" && <span className="text-yellow-400">⏸ ポーズ中 — IP: {state.instrPointer} / {filtered.length} (ステップ: {state.steps.toLocaleString()})</span>}
              </div>
            )}
          </div>

          {/* Right: IO */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">標準入力</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-sm text-zinc-300 resize-none outline-none focus:border-emerald-500 transition-colors"
                placeholder="入力文字列..."
              />
              {state && (
                <p className="text-xs text-zinc-600 mt-1">
                  消費済み: {state.inputIndex} / {input.length} 文字
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">標準出力</label>
              <div className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-sm text-zinc-100 min-h-[96px] max-h-48 overflow-auto whitespace-pre-wrap break-all">
                {state?.output || <span className="text-zinc-600">出力がここに表示されます</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tape */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wide">メモリテープ</h2>
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAscii}
                onChange={(e) => setShowAscii(e.target.checked)}
                className="accent-emerald-500"
              />
              ASCII表示
            </label>
          </div>
          <TapeView
            tape={state?.tape ?? new Array(100).fill(0)}
            pointer={state?.pointer ?? 0}
            showAscii={showAscii}
          />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
