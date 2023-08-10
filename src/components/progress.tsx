import { CSSProperties, useMemo } from "react";

export default function Progress({ start, end, style }: { start: number; end: number; style?: CSSProperties }) {
  const percent = useMemo(() => {
    const now = Date.now();

    if (start >= end || now >= end) {
      return 100;
    } else if (now <= start) {
      return 0;
    } else {
      return ((now - start) / (end - start)) * 100;
    }
  }, [start, end]);

  return (
    <div className="relative h-1 w-full rounded bg-primary/40" style={style}>
      <div className="absolute left-0 top-0 h-1 rounded bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}
