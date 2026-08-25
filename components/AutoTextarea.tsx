"use client";

import { useEffect, useRef } from "react";

// A textarea that grows to fit its content instead of scrolling internally -
// so a longer answer reads as a paragraph, not a cramped single line.
export default function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 1,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}
