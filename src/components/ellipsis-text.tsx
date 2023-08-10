"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { timer } from "rxjs";

export default function EllipsisText({ text, textClassName }: { text: string; textClassName?: string }) {
  const [content, setContent] = useState<ReactNode>(text);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listener = () => {
      if (ref.current && ref.current.scrollWidth > ref.current.clientWidth) {
        setContent(
          <>
            <div
              className="-mr-large inline-block truncate"
              style={{ width: ref.current.clientWidth / 2 - 12, color: "transparent" }}
            >
              <span className={textClassName}>{text}</span>
            </div>
            <div className="inline-block truncate" style={{ width: ref.current.clientWidth / 2 }} dir="rtl">
              {text}
            </div>
          </>
        );
      } else {
        setContent(text);
      }
    };

    const sub$$ = timer(200).subscribe(() => listener());
    window.addEventListener("resize", listener, false);

    return () => {
      window.removeEventListener("resize", listener, false);
      sub$$.unsubscribe();
    };
  }, [text, textClassName]);

  return (
    <div className={`inline truncate ${textClassName}`} ref={ref}>
      {content}
    </div>
  );
}
