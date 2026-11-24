import type { CSSProperties } from "react";

export function brandStyle(name: string): CSSProperties {
  void name;
  return { "--brand-bg": "var(--green)", "--brand-ink": "#ffffff" } as CSSProperties;
}
