"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateStats,
  formatTime,
  type Solve,
  type TimerState,
} from "@cube-practice/timer-domain";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchScramble, scrambleQueryKey } from "@/features/scramble/scrambleQuery";

const STORAGE_KEY = "cube-practice:solves:v1";

export default function TimerWorkspace() {
  const queryClient = useQueryClient();
  const {
    data: scramble,
    isFetching,
    isError,
  } = useQuery({
    queryKey: scrambleQueryKey,
    queryFn: fetchScramble,
  });
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const startedAt = useRef(0);

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
    if (!scramble || isFetching) return;
    setElapsed(0);
    startedAt.current = performance.now();
    setTimerState("running");
  }, [isFetching, scramble]);

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
    void queryClient.invalidateQueries({ queryKey: scrambleQueryKey });
  }, [queryClient, scramble?.notation, timerState]);

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

  async function nextScramble() {
    await queryClient.invalidateQueries({ queryKey: scrambleQueryKey });
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

  return (
    <section className="workspace" aria-label="3×3×3 タイマー">
      <div className="top-bar">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <strong>3×3×3</strong>
          <span>WCA TIMER</span>
        </div>
        <div className="solve-count">
          <strong>{solves.length}</strong>
          <span>solves</span>
        </div>
      </div>

      <div className={`timer-card state-${timerState}`}>
        <div className="scramble-area">
          <div className="scramble-heading">
            <span>SCRAMBLE</span>
            <button
              aria-label="次のスクランブル"
              disabled={isFetching || timerState === "running"}
              onClick={() => void nextScramble()}
              type="button"
            >
              <span aria-hidden="true">↻</span> 次へ
            </button>
          </div>
          <p>{isError ? "スクランブルを取得できません" : (scramble?.notation ?? "生成中…")}</p>
        </div>

        <button
          aria-label={instruction}
          className="timer-face"
          onClick={() => (timerState === "running" ? stopTimer() : startTimer())}
          type="button"
        >
          <span className="timer-value">{formatTime(elapsed)}</span>
          <span className="timer-instruction">
            <i aria-hidden="true" />
            {instruction}
          </span>
        </button>
      </div>

      <section className="stats-section" aria-labelledby="stats-heading">
        <div className="section-heading">
          <div>
            <span>SESSION</span>
            <h2 id="stats-heading">記録と統計</h2>
          </div>
          <span className="storage-note">この端末に自動保存</span>
        </div>
        <div className="stat-grid">
          {stats.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value === null ? "—" : formatTime(item.value)}</strong>
              {item.label.startsWith("Ao") && <small>best / worst 除外</small>}
            </article>
          ))}
        </div>

        <div className="history">
          <div className="history-head">
            <span>#</span>
            <span>タイム</span>
            <span>スクランブル</span>
            <span />
          </div>
          {solves.length === 0 ? (
            <div className="empty-state">
              <strong>最初のソルブを始めましょう</strong>
              <span>記録はここに追加されます</span>
            </div>
          ) : (
            solves.slice(0, 100).map((solve, index) => (
              <div className="solve-row" key={solve.id}>
                <span>{solves.length - index}</span>
                <strong>{formatTime(solve.milliseconds, true)}</strong>
                <span title={solve.scramble}>{solve.scramble}</span>
                <button
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
