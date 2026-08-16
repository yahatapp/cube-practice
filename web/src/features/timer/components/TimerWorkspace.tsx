"use client";

import type { Scramble } from "@cube-practice/scramble";
import {
  calculateStats,
  formatTime,
  type Solve,
  type TimerState,
} from "@cube-practice/timer-domain";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createWebScramble } from "@/features/scramble/createWebScramble";

const STORAGE_KEY = "cube-practice:solves:v1";

export default function TimerWorkspace() {
  const [scramble, setScramble] = useState<Scramble | null>(null);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    // Generate after hydration so the exported HTML and first client render stay identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScramble(createWebScramble());
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Restore only after mount so the server and first client render stay identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSolves(JSON.parse(stored) as Solve[]);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
  }, [hydrated, solves]);

  useEffect(() => {
    if (timerState !== "running") return;
    let frame = 0;
    const tick = () => {
      setElapsed(performance.now() - startedAt.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timerState]);

  const startTimer = useCallback(() => {
    if (!scramble) return;
    setElapsed(0);
    startedAt.current = performance.now();
    setTimerState("running");
  }, [scramble]);

  const stopTimer = useCallback(() => {
    if (timerState !== "running") return;
    const finalTime = performance.now() - startedAt.current;
    setElapsed(finalTime);
    setTimerState("idle");
    setSolves((current) => [
      {
        id: crypto.randomUUID(),
        milliseconds: finalTime,
        scramble: scramble?.notation ?? "",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setScramble(createWebScramble());
  }, [scramble?.notation, timerState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement) return;
      if (timerState === "running") {
        if (!event.repeat) stopTimer();
        event.preventDefault();
        return;
      }
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        setTimerState("ready");
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || timerState !== "ready") return;
      event.preventDefault();
      startTimer();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startTimer, stopTimer, timerState]);

  const stats = useMemo(() => {
    const values = calculateStats(solves);
    return [
      { label: "Best", value: values.best },
      { label: "Ao5", value: values.ao5 },
      { label: "Ao12", value: values.ao12 },
      { label: "Ao100", value: values.ao100 },
    ];
  }, [solves]);

  function nextScramble() {
    setScramble(createWebScramble());
  }

  function removeSolve(id: string) {
    setSolves((current) => current.filter((solve) => solve.id !== id));
  }

  const instruction =
    timerState === "running"
      ? "任意のキーまたはタップでストップ"
      : timerState === "ready"
        ? "離してスタート"
        : "Spaceを長押し、またはタップしてスタート";

  const timerFaceStateClass =
    timerState === "ready"
      ? "text-emerald-400 bg-emerald-400/5"
      : timerState === "running"
        ? "text-indigo-200"
        : "text-zinc-200";

  const instructionDotStateClass =
    timerState === "ready"
      ? "bg-emerald-400 ring-4 ring-emerald-400/10"
      : timerState === "running"
        ? "bg-indigo-200 animate-pulse motion-reduce:animate-none"
        : "bg-zinc-500";

  return (
    <section className="grid gap-5" aria-label="3×3×3 タイマー">
      <div className="flex min-h-13 items-center gap-3 px-1">
        <div
          className="grid size-10 -rotate-3 grid-cols-2 gap-0.5 rounded-xl bg-indigo-900 p-2"
          aria-hidden="true"
        >
          <span className="rounded-sm bg-indigo-200" />
          <span className="rounded-sm bg-rose-300" />
          <span className="rounded-sm bg-amber-300" />
          <span className="rounded-sm bg-emerald-400" />
        </div>
        <div className="grid gap-0.5">
          <strong className="text-base">3×3×3</strong>
          <span className="text-xs font-bold tracking-widest text-zinc-300">WCA TIMER</span>
        </div>
        <div className="ml-auto grid gap-0 text-right">
          <strong className="text-lg tabular-nums">{solves.length}</strong>
          <span className="text-xs font-bold tracking-widest text-zinc-300">solves</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="border-b border-zinc-700 px-6 py-5 max-sm:px-4">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-widest text-indigo-200">SCRAMBLE</span>
            <button
              className="min-h-10 cursor-pointer rounded-full bg-indigo-200/10 px-4 py-2 text-indigo-200 transition-colors hover:bg-indigo-200/20 disabled:cursor-default disabled:opacity-50"
              aria-label="次のスクランブル"
              disabled={!scramble || timerState === "running"}
              onClick={nextScramble}
              type="button"
            >
              <span aria-hidden="true">↻</span> 次へ
            </button>
          </div>
          <p className="mx-auto max-w-4xl text-center font-mono text-base font-semibold leading-loose tracking-wide text-zinc-200 sm:text-xl">
            {scramble?.notation ?? "生成中…"}
          </p>
        </div>

        <button
          aria-label={instruction}
          className={`grid min-h-75 w-full cursor-pointer select-none place-content-center border-0 bg-transparent px-4 py-8 transition-colors duration-200 ease-in-out touch-none hover:bg-white/5 max-sm:min-h-68 md:min-h-90 ${timerFaceStateClass}`}
          onClick={() => (timerState === "running" ? stopTimer() : startTimer())}
          type="button"
        >
          <span className="block text-center text-8xl font-medium leading-none tracking-tighter tabular-nums sm:text-9xl">
            {formatTime(elapsed)}
          </span>
          <span className="mt-6 flex items-center justify-center gap-2.5 text-center text-sm font-semibold leading-relaxed tracking-wide text-zinc-300 max-sm:mx-auto max-sm:max-w-60">
            <i
              className={`size-2 shrink-0 rounded-full ${instructionDotStateClass}`}
              aria-hidden="true"
            />
            {instruction}
          </span>
        </button>
      </div>

      <section
        className="overflow-visible rounded-3xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl sm:p-6 md:p-7"
        aria-labelledby="stats-heading"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-indigo-200">SESSION</span>
            <h2 className="mt-1 text-2xl tracking-tight" id="stats-heading">
              記録と統計
            </h2>
          </div>
          <span className="text-xs text-zinc-300">この端末に自動保存</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {stats.map((item) => (
            <article className="min-w-0 rounded-2xl bg-zinc-800 p-4" key={item.label}>
              <span className="block text-xs font-bold text-zinc-300">{item.label}</span>
              <strong className="mt-2 block text-2xl font-semibold tabular-nums sm:text-3xl">
                {item.value === null ? "—" : formatTime(item.value)}
              </strong>
              {item.label.startsWith("Ao") && (
                <small className="mt-1 block min-h-4 text-xs text-zinc-500">
                  best / worst 除外
                </small>
              )}
            </article>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-700">
          <div className="flex min-h-9 items-center gap-2 bg-black/10 px-3 text-xs uppercase tracking-widest text-zinc-500 max-sm:px-2">
            <span className="w-8 shrink-0">#</span>
            <span className="w-20 shrink-0">タイム</span>
            <span className="min-w-0 flex-1">スクランブル</span>
            <span className="w-8 shrink-0" />
          </div>
          {solves.length === 0 ? (
            <div className="grid min-h-32 place-items-center border-t border-zinc-700 text-center">
              <strong>最初のソルブを始めましょう</strong>
              <span className="-mt-9 text-xs text-zinc-500">記録はここに追加されます</span>
            </div>
          ) : (
            solves.slice(0, 100).map((solve, index) => (
              <div
                className="flex min-h-14 items-center gap-2 border-t border-zinc-700 px-3 max-sm:px-2"
                key={solve.id}
              >
                <span className="w-8 shrink-0 text-xs text-zinc-500">{solves.length - index}</span>
                <strong className="w-20 shrink-0 tabular-nums">
                  {formatTime(solve.milliseconds, true)}
                </strong>
                <span
                  className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-zinc-300"
                  title={solve.scramble}
                >
                  {solve.scramble}
                </span>
                <button
                  className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent text-zinc-500 transition-colors hover:bg-red-300/10 hover:text-red-300"
                  aria-label={`${formatTime(solve.milliseconds)}の記録を削除`}
                  onClick={() => removeSolve(solve.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
