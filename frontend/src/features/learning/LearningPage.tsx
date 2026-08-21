import { useState } from "react";
import { useNavigate } from "react-router";

type Track = { role: string; blurb: string; concepts: string[]; steps: [string, string][] };

const TRACKS: Record<string, Track> = {
  lead: {
    role: "Commissioning / BIM lead",
    blurb: "You own the consolidated register for the client. Set the rules once, then govern data quality across every trade.",
    concepts: ["Naming convention", "Reference lists", "Register schema", "Cross-trade validation", "Consolidated export"],
    steps: [
      ["Create the project", "Configuration → create a project, set the site/building reference and the naming mode (auto-generate or import/manual)."],
      ["Load reference lists", "Import buildings, levels, spaces, systems, zones and equipment types. These become the validated dropdowns every trade picks from."],
      ["Import the register schema", "Load your project's CONTRACTOR ASSET template. Its columns become the register — QR fields, BIM coordinates, whatever this project needs."],
      ["Add the trades", "Add each system owner (BMS, EMS, lighting, security, mechanical, fire). Each gets its own register, all in one database."],
      ["Watch the Overview", "Completeness per trade, assets with errors, and — the one Excel can't do — duplicate Instance Names across trades, on one screen."],
      ["Export for handover", "When the register is clean, export the consolidated register or a validation report to CSV/XLSX. Sensitive fields are excluded by default."],
    ],
  },
  engineer: {
    role: "Trade / system-owner engineer",
    blurb: "You fill your own trade's register. The tool checks every cell as you go, so nothing wrong reaches handover.",
    concepts: ["Validated dropdowns", "Cell-level validation", "Auto-generated names", "The fault list", "Import a filled sheet"],
    steps: [
      ["Pick your trade", "Asset Management → choose your trade. You see only your register, full page width."],
      ["Import or add assets", "Import a filled sheet for your trade, or add assets row by row. Values validate against the project's reference lists."],
      ["Read the tinted cells", "An invalid reference or missing mandatory field turns the cell red; a format warning turns it amber. Fix it in place against the dropdown."],
      ["Generate names (if auto)", "On an auto-naming project, click Generate names to build BDNS-aligned Instance Names from the parameters — uniqueness enforced."],
      ["Work the fault list", "Below the grid, every issue is listed with an Open asset link that jumps straight to the offending cell. Clear them one by one."],
      ["Watch duplicates clear", "If your Instance Name clashes with another trade's, it's flagged project-wide. Rename it and the flag clears on the next save."],
    ],
  },
};

export function LearningPage() {
  const navigate = useNavigate();
  const [key, setKey] = useState<keyof typeof TRACKS>("lead");
  const track = TRACKS[key];
  return (
    <div className="app-page">
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">Learning</span><h3>Pick your role</h3></div>
        </div>
        <div className="inline-actions" style={{ marginBottom: 12 }}>
          <button className={`secondary-button${key === "lead" ? " selected" : ""}`} onClick={() => setKey("lead")}>Commissioning lead</button>
          <button className={`secondary-button${key === "engineer" ? " selected" : ""}`} onClick={() => setKey("engineer")}>Trade engineer</button>
        </div>
        <p className="section-copy">{track.blurb}</p>
        <div className="inline-actions" style={{ flexWrap: "wrap" }}>
          {track.concepts.map((c) => <span className="chip accent" key={c}>{c}</span>)}
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">{track.role}</span><h3>Walkthrough</h3></div>
        </div>
        <div className="app-grid">
          {track.steps.map(([label, body], i) => (
            <div className="brief-step" key={label}
              style={{ minHeight: 0, flexDirection: "row", alignItems: "flex-start", gap: 14, display: "flex" }}>
              <b style={{ flexShrink: 0 }}>{i + 1}</b>
              <div><span>{label}</span><small style={{ display: "block", marginTop: 4 }}>{body}</small></div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="state-panel success">
          <strong>Try it now</strong>
          <span>The fastest way to learn it is to run it: load the sample project and watch a real register validate.</span>
        </div>
        <div className="inline-actions" style={{ marginTop: 12 }}>
          <button className="primary-button" onClick={() => navigate("/")}>Open the tool</button>
          <button className="secondary-button" onClick={() => navigate("/brief")}>Read the brief</button>
        </div>
      </section>
    </div>
  );
}
