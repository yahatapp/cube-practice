"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchScramble, scrambleQueryKey } from "@/lib/queries/scramble";

type Mode = "normal" | "xcross" | "f2l1";
type Solve = { id: string; mode: Mode; milliseconds: number; scramble: string };

const modes: { id: Mode; label: string; hint: string }[] = [
  { id: "normal", label: "通常タイマー", hint: "フルソルブ" },
  { id: "xcross", label: "X-Cross", hint: "クロス＋第1ペア" },
  { id: "f2l1", label: "F2L #1 読み", hint: "第1ペアに集中" },
];

function formatTime(milliseconds: number) {
  return (milliseconds / 1000).toFixed(2);
}

export function TimerWorkspace() {
  const queryClient = useQueryClient();
  const {
    data: scramble,
    isFetching,
    isError,
  } = useQuery({
    queryKey: scrambleQueryKey,
    queryFn: fetchScramble,
  });
  const [mode, setMode] = useState<Mode>("normal");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [solves, setSolves] = useState<Solve[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      setElapsed(performance.now() - startedAt.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const toggleTimer = useCallback(() => {
    if (!running) {
      setElapsed(0);
      startedAt.current = performance.now();
      setRunning(true);
      return;
    }

    const finalTime = performance.now() - startedAt.current;
    setElapsed(finalTime);
    setRunning(false);
    setSolves((current) => [
      {
        id: crypto.randomUUID(),
        mode,
        milliseconds: finalTime,
        scramble: scramble?.notation ?? "",
      },
      ...current,
    ]);
    void queryClient.invalidateQueries({ queryKey: scrambleQueryKey });
  }, [mode, queryClient, running, scramble?.notation]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      toggleTimer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleTimer]);

  const averages = useMemo(() => {
    return modes.map(({ id, label }) => {
      const entries = solves.filter((solve) => solve.mode === id);
      const average = entries.length
        ? entries.reduce((total, solve) => total + solve.milliseconds, 0) / entries.length
        : null;
      return { id, label, count: entries.length, average };
    });
  }, [solves]);

  async function nextScramble() {
    await queryClient.invalidateQueries({ queryKey: scrambleQueryKey });
  }

  return (
    <section className="workspace" aria-label="タイマー">
      <nav className="mode-tabs" aria-label="練習モード">
        {modes.map((item) => (
          <button
            aria-pressed={mode === item.id}
            className={mode === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setMode(item.id)}
            type="button"
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className="timer-card">
        <div className="scramble-row">
          <p>{isError ? "取得エラー" : (scramble?.notation ?? "生成中…")}</p>
          <button
            disabled={isFetching || running}
            onClick={() => void nextScramble()}
            type="button"
          >
            {isFetching ? "…" : "次へ"}
          </button>
        </div>
        <button className={`timer ${running ? "running" : ""}`} onClick={toggleTimer} type="button">
          <span>{formatTime(elapsed)}</span>
          <small>{running ? "タップして停止" : "タップ / Space で開始"}</small>
        </button>
      </div>

      <div className="insights">
        <div>
          <p className="eyebrow">SESSION SIGNAL</p>
          <h2>読みの傾向</h2>
          <p>
            {solves.length
              ? "モード別の平均を比較できます。"
              : "各モードを計測すると傾向が表示されます。"}
          </p>
        </div>
        <div className="stats-grid">
          {averages.map((item) => (
            <article key={item.id}>
              <span>{item.label}</span>
              <strong>{item.average === null ? "—" : `${formatTime(item.average)}s`}</strong>
              <small>{item.count} solves</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
