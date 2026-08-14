/**
 * Formats milliseconds with centisecond precision.
 *
 * Fractional centiseconds are truncated to preserve the timer's existing
 * display behavior.
 */
export function formatTime(milliseconds: number, suffix = false): string {
  const centiseconds = Math.floor(milliseconds / 10);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = Math.floor((centiseconds % 6000) / 100);
  const fraction = centiseconds % 100;
  const value = minutes
    ? `${minutes}:${String(seconds).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`
    : `${seconds}.${String(fraction).padStart(2, "0")}`;

  return suffix ? `${value}s` : value;
}
