import { useState } from "react";

// Small info popover — click the 'i' to reveal help text; doesn't navigate.
export function Info({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle", marginLeft: 6 }}>
      <button
        type="button"
        aria-label="Show help"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{
          width: 16, height: 16, borderRadius: "50%", border: "1px solid var(--border)",
          background: "var(--surface)", color: "var(--muted)", fontSize: 10, lineHeight: 1,
          cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center",
        }}
      >i</button>
      {open ? (
        <span
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", left: 20, top: -4, zIndex: 40, width: 260,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-strong)",
            padding: "10px 12px", fontSize: 12, lineHeight: 1.5, color: "var(--text)",
            fontWeight: 400, textTransform: "none", letterSpacing: 0,
          }}
        >{text}</span>
      ) : null}
    </span>
  );
}
