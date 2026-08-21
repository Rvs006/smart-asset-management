import { useNavigate } from "react-router";

const ENGINES = [
  ["Schema engine", "Your CONTRACTOR ASSET template becomes the register — columns, requirements and validation rules are imported data, not code. Every project can differ."],
  ["Naming engine", "Auto-generate BDNS-aligned Instance Names from parameters, or import names created in BIM. Either way they're checked for uniqueness and format."],
  ["Reference lists", "Buildings, levels, spaces, systems, zones and equipment types drive validated dropdowns — nobody types a level that doesn't exist."],
  ["Validation engine", "Invalid references, missing mandatory fields, format errors and — the thing Excel can't do — duplicate Instance Names across every trade, traceable to the cell."],
];

const STEPS = [
  ["Configure", "Create a project, set the naming convention, import reference lists and the register template."],
  ["Populate", "Each trade fills its register against validated dropdowns, or imports a filled sheet."],
  ["Validate", "Faults light up on the grid and in the fault list the moment data lands."],
  ["Export", "Produce a clean, consolidated, handover-ready register — or a validation report — on demand."],
];

export function BriefPage() {
  const navigate = useNavigate();
  return (
    <div className="app-page">
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">The one-liner</span><h3>One governed register, not seven spreadsheets</h3></div>
        </div>
        <p className="section-copy">
          The Smart Asset Management Tool replaces the per-trade Excel "Smart Asset Registers" on a
          smart-building project with a single governed, validated database. Define the naming convention
          and reference lists once, import the project's own register template, and every trade populates
          against validated dropdowns — with cross-trade duplicate detection and cell-level validation that
          Excel structurally cannot do. It exports back to spreadsheet any time, so adopting it is never a
          one-way door. Built in the same look, feel and stack as the Smart Commissioning Tool.
        </p>
        <div className="inline-actions">
          <button className="primary-button" onClick={() => navigate("/")}>Open the tool</button>
          <button className="secondary-button" onClick={() => navigate("/learning")}>Learning walkthroughs</button>
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">The problem</span><h3>Why the Excel way hurts</h3></div>
        </div>
        <p className="section-copy">
          Every project runs on seven-plus separate Excel registers, one per system owner, each with a
          slightly different column set. Instance Names collide across trades, levels and rooms get typed
          wrong, and per-project rules (QR required? BIM coordinates? cyber fields?) drift — and none of it
          is caught until handover, when fixing it is slow, expensive, and the client is watching. Excel
          can't see across tabs, so the cross-trade problems are invisible until it's too late.
        </p>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">How it works</span><h3>Four engines under the hood</h3></div>
        </div>
        <div className="app-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
          {ENGINES.map(([t, body]) => (
            <div className="brief-step" key={t} style={{ minHeight: 0 }}>
              <span>{t}</span>
              <small>{body}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">The workflow</span><h3>Four steps to a clean register</h3></div>
        </div>
        <div className="app-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
          {STEPS.map(([label, body], i) => (
            <div className="brief-step" key={label}>
              <b>{i + 1}</b><span>{label}</span><small>{body}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="state-panel success">
          <strong>The magic moment</strong>
          <span>
            Import a real trade register and, within seconds, see the cross-trade duplicate Instance Names
            and invalid references Excel was hiding — each traceable to the exact cell. That's the moment the
            register stops being a document and becomes a governed database.
          </span>
        </div>
      </section>

      <section className="surface">
        <div className="surface-heading">
          <div><span className="eyebrow">Who it's for</span><h3>Two users, one register</h3></div>
        </div>
        <div className="app-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
          <div className="brief-step" style={{ minHeight: 0 }}>
            <span>The commissioning / BIM lead</span>
            <small>Owns the consolidated register for the client. Sets the naming and data rules, watches project-wide completeness and duplicates, exports the handover-ready register.</small>
          </div>
          <div className="brief-step" style={{ minHeight: 0 }}>
            <span>The trade / system-owner engineer</span>
            <small>Fills their own trade's register (BMS, EMS, lighting, security, mechanical, fire) against validated dropdowns, with faults flagged as they type.</small>
          </div>
        </div>
        <p className="field-note" style={{ marginTop: 12 }}>
          Not for facilities/operations teams wanting a live O&amp;M database or BMS integration — that's the
          operational life of the asset, a separate scope.
        </p>
      </section>
    </div>
  );
}
