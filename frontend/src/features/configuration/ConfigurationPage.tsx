import { useState } from "react";
import { useProject } from "../../app/project";
import { downloadUrl } from "../../api/client";
import {
  useProjects, useProject as useProjectQuery, useReferences, useReferenceValues, useSchema,
  useTrades, useNaming, useNamingPresets, useSeedDemo, useCreateProject, useValidate,
  useAddField, usePatchField, useDeleteField, useAddReference, useDeleteReference,
  useAddTrade, usePatchTrade, useDeleteTrade, useApplyPreset, useSetNaming,
} from "../../api/queries";

export function ConfigurationPage() {
  const { projectId, setProjectId } = useProject();
  const projects = useProjects();
  const seed = useSeedDemo();
  const create = useCreateProject();
  const validate = useValidate(projectId);
  const [newName, setNewName] = useState("");
  const list = (projects.data as any[]) ?? [];

  return (
    <div className="app-page">
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">Project</span><h3>Select or create a project</h3></div>
          {projectId ? <span className="status-token ready">Loaded</span> : null}
        </div>
        <div className="field-grid">
          <label className="field"><span>Project</span>
            <select className="control" value={projectId ?? ""} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">— select —</option>
              {list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Create a new project</span>
            <div className="inline-actions">
              <input className="control" placeholder="Project name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <button className="secondary-button" disabled={!newName || create.isPending}
                onClick={() => create.mutate({ name: newName }, { onSuccess: (p: any) => { setProjectId(p.id); setNewName(""); } })}>Create</button>
            </div>
          </label>
        </div>
        <div className="inline-actions" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button className="primary-button" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: (r: any) => setProjectId(r.project_id) })}>
            {seed.isPending ? "Loading…" : "Load sample project"}
          </button>
          {projectId ? (<>
            <button className="secondary-button" disabled={validate.isPending}
              onClick={() => validate.mutate(undefined, { onSuccess: (s: any) => alert(`Validation: ${s.error_count} errors, ${s.warning_count} warnings.`) })}>
              {validate.isPending ? "Validating…" : "Validate project"}
            </button>
            <a className="secondary-button" href={downloadUrl(`/projects/${projectId}/config/export`)}>Export configuration (JSON)</a>
          </>) : null}
        </div>
      </section>

      {!projectId ? (
        <div className="empty-workspace"><strong>No project selected</strong><span>Select, create, or load the sample project to configure it.</span></div>
      ) : (<>
        <NamingSection pid={projectId} />
        <TradesSection pid={projectId} />
        <ReferencesSection pid={projectId} />
        <SchemaSection pid={projectId} />
      </>)}
    </div>
  );
}

// ---- Naming: pick a preset, or edit segments manually --------------------
function NamingSection({ pid }: { pid: number }) {
  const naming = useNaming(pid);
  const presets = useNamingPresets(pid);
  const apply = useApplyPreset(pid);
  const setNaming = useSetNaming(pid);
  const [segs, setSegs] = useState<any[] | null>(null);
  const current = segs ?? (naming.data as any)?.segments ?? [];
  const allPresets = [...((presets.data as any)?.builtin ?? []), ...((presets.data as any)?.saved ?? [])];

  const edit = (i: number, key: string, val: any) => {
    const next = current.map((s: any, n: number) => n === i ? { ...s, [key]: val } : s);
    setSegs(next);
  };
  const addSeg = () => setSegs([...current, { sequence: current.length + 1, name: "New", source_field: "", segment_type: "reference", fixed_value: "", length: 0, pad_char: "0", pad_dir: "left", delimiter_before: current.length ? "-" : "" }]);
  const removeSeg = (i: number) => setSegs(current.filter((_: any, n: number) => n !== i));
  const save = () => setNaming.mutate({ name: "Project naming", standard: "BDNS", mode: "auto", case_mode: "upper", segments: current.map((s: any, i: number) => ({ ...s, sequence: i + 1 })) }, { onSuccess: () => setSegs(null) });

  return (
    <section className="surface" style={{ marginBottom: 14 }}>
      <div className="surface-heading">
        <div><span className="eyebrow">Asset naming convention</span><h3>Build it, or pick a saved one</h3></div>
      </div>
      <div className="field-grid" style={{ marginBottom: 12 }}>
        <label className="field"><span>Pick a convention</span>
          <select className="control" defaultValue="" onChange={(e) => { if (e.target.value) { apply.mutate(e.target.value, { onSuccess: () => setSegs(null) }); e.target.value = ""; } }}>
            <option value="">— apply a preset —</option>
            {allPresets.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div className="field"><span>Live preview</span>
          <div className="sam-namepreview">{current.length ? current.map((s: any) => s.name).join(" · ") : "no segments"}</div>
        </div>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>#</th><th>Segment</th><th>Source field</th><th>Type</th><th>Length</th><th>Delimiter</th><th></th></tr></thead>
          <tbody>
            {current.map((s: any, i: number) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input className="cell-input" value={s.name} onChange={(e) => edit(i, "name", e.target.value)} /></td>
                <td><input className="cell-input" value={s.source_field} onChange={(e) => edit(i, "source_field", e.target.value)} /></td>
                <td>
                  <select className="cell-select" value={s.segment_type} onChange={(e) => edit(i, "segment_type", e.target.value)}>
                    {["lookup", "reference", "fixed", "number"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td><input className="cell-input" style={{ width: 60 }} type="number" value={s.length} onChange={(e) => edit(i, "length", Number(e.target.value))} /></td>
                <td><input className="cell-input" style={{ width: 60 }} value={s.delimiter_before} onChange={(e) => edit(i, "delimiter_before", e.target.value)} /></td>
                <td><button className="link-button" onClick={() => removeSeg(i)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="inline-actions" style={{ marginTop: 12 }}>
        <button className="secondary-button compact" onClick={addSeg}>+ Add segment</button>
        <button className="primary-button" disabled={setNaming.isPending || !segs} onClick={save}>{setNaming.isPending ? "Saving…" : "Save convention"}</button>
        {segs ? <button className="secondary-button compact" onClick={() => setSegs(null)}>Cancel</button> : null}
      </div>
      <p className="field-note">Names are checked for uniqueness and format whether generated or imported. Source fields map to parameter keys (e.g. <code>level</code>, <code>unique_local_number</code>, <code>abbreviation</code>).</p>
    </section>
  );
}

// ---- Trades / system owners ----------------------------------------------
function TradesSection({ pid }: { pid: number }) {
  const trades = useTrades(pid);
  const add = useAddTrade(pid);
  const patch = usePatchTrade(pid);
  const del = useDeleteTrade(pid);
  const [code, setCode] = useState(""); const [owner, setOwner] = useState("");
  const list = (trades.data as any[]) ?? [];
  return (
    <section className="surface" style={{ marginBottom: 14 }}>
      <div className="surface-heading"><div><span className="eyebrow">System owners</span><h3>Trades</h3></div></div>
      <div className="data-table-wrap" style={{ marginBottom: 12 }}>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>System owner</th><th>Assets</th><th></th></tr></thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td><input className="cell-input" defaultValue={t.code} onBlur={(e) => e.target.value !== t.code && patch.mutate({ id: t.id, body: { code: e.target.value, name: t.name, system_owner: t.system_owner } })} /></td>
                <td><input className="cell-input" defaultValue={t.name} onBlur={(e) => e.target.value !== t.name && patch.mutate({ id: t.id, body: { code: t.code, name: e.target.value, system_owner: t.system_owner } })} /></td>
                <td><input className="cell-input" defaultValue={t.system_owner} onBlur={(e) => e.target.value !== t.system_owner && patch.mutate({ id: t.id, body: { code: t.code, name: t.name, system_owner: e.target.value } })} /></td>
                <td>{t.asset_count}</td>
                <td><button className="link-button" style={{ color: "var(--red)" }} onClick={() => del.mutate(t.id, { onError: (e: any) => alert(String(e.message)) })}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sam-toolbar">
        <input className="control" placeholder="Code (e.g. BMS)" value={code} onChange={(e) => setCode(e.target.value)} style={{ maxWidth: 160 }} />
        <input className="control grow" placeholder="System owner (optional)" value={owner} onChange={(e) => setOwner(e.target.value)} />
        <button className="secondary-button" disabled={!code || add.isPending} onClick={() => add.mutate({ code, name: code, system_owner: owner }, { onSuccess: () => { setCode(""); setOwner(""); } })}>+ Add trade</button>
      </div>
    </section>
  );
}

// ---- Reference lists (editable per kind) ---------------------------------
const REF_KINDS: [string, string][] = [
  ["level", "Levels"], ["space", "Spaces / Rooms"], ["system", "Systems"],
  ["zone", "Operational Zones"], ["equipment_type", "Equipment Types"], ["building", "Buildings"],
];
function ReferencesSection({ pid }: { pid: number }) {
  const [openKind, setOpenKind] = useState<string | null>(null);
  const refs = useReferences(pid);
  const counts = (refs.data as any)?.counts ?? {};
  return (
    <section className="surface" style={{ marginBottom: 14 }}>
      <div className="surface-heading"><div><span className="eyebrow">Reference lists</span><h3>Controlled values for dropdowns &amp; validation</h3></div></div>
      <div className="sam-refgrid">
        {REF_KINDS.map(([kind, label]) => (
          <div className="impbox sam-clickable" key={kind} onClick={() => setOpenKind(openKind === kind ? null : kind)}>
            <b>{label}</b>
            <span className={counts[kind] ? "chip" : "chip amber"}>{counts[kind] ?? 0}{openKind === kind ? " ▲" : " ▾"}</span>
          </div>
        ))}
      </div>
      {openKind ? <ReferenceKindEditor pid={pid} kind={openKind} /> : null}
      <p className="field-note" style={{ marginTop: 10 }}>Click a list to edit its values, or import a sheet on the register-import panels. Removing a value that assets still use will flag those cells.</p>
    </section>
  );
}
function ReferenceKindEditor({ pid, kind }: { pid: number; kind: string }) {
  const values = useReferenceValues(pid, kind);
  const add = useAddReference(pid);
  const del = useDeleteReference(pid);
  const [code, setCode] = useState(""); const [label, setLabel] = useState("");
  const rows = (values.data as any[]) ?? [];
  return (
    <div className="state-panel" style={{ marginTop: 12 }}>
      <strong style={{ marginBottom: 8, textTransform: "capitalize" }}>{kind.replace("_", " ")} values ({rows.length})</strong>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {rows.map((r) => (
          <span className="chip accent" key={r.id} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            {r.code}<button className="link-button" style={{ color: "var(--red)", fontSize: 13, lineHeight: 1 }} onClick={() => del.mutate(r.id)}>×</button>
          </span>
        ))}
      </div>
      <div className="sam-toolbar">
        <input className="control" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} style={{ maxWidth: 140 }} />
        <input className="control grow" placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button className="secondary-button" disabled={!code || add.isPending} onClick={() => add.mutate({ kind, code, label }, { onSuccess: () => { setCode(""); setLabel(""); } })}>+ Add</button>
      </div>
    </div>
  );
}

// ---- Register schema (editable: visible, responsibility, add, delete) ----
function SchemaSection({ pid }: { pid: number }) {
  const schema = useSchema(pid);
  const addField = useAddField(pid);
  const patchField = usePatchField(pid);
  const delField = useDeleteField(pid);
  const [name, setName] = useState(""); const [resp, setResp] = useState("");
  const fields = (schema.data as any[]) ?? [];
  return (
    <section className="surface">
      <div className="surface-heading">
        <div><span className="eyebrow">Register schema</span><h3>Parameters shown in Asset Management</h3></div>
        <span className="status-token ready">{fields.filter((f) => f.visible).length}/{fields.length} shown</span>
      </div>
      <div className="data-table-wrap" style={{ marginBottom: 12 }}>
        <table className="data-table">
          <thead><tr><th>Show</th><th>Parameter</th><th>Requirement</th><th>Responsibility</th><th>Validation</th><th></th></tr></thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id}>
                <td><input type="checkbox" checked={!!f.visible} onChange={(e) => patchField.mutate({ id: f.id, body: { visible: e.target.checked } })} /></td>
                <td><b>{f.display_name}</b>{f.auto_generated ? <span className="id-sub">generated</span> : null}</td>
                <td>
                  <select className="cell-select" value={f.required} onChange={(e) => patchField.mutate({ id: f.id, body: { required: e.target.value } })}>
                    {["yes", "no", "conditional"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <select className="cell-select" value={f.responsibility || ""} onChange={(e) => patchField.mutate({ id: f.id, body: { responsibility: e.target.value } })}>
                    <option value="">— unset —</option>
                    <option value="trade">Trade</option>
                    <option value="us">Us</option>
                  </select>
                </td>
                <td>{f.validation_type}{f.reference_kind ? ` (${f.reference_kind})` : f.format_rule ? ` (${f.format_rule})` : ""}</td>
                <td>{f.field_key === "instance_name" ? null : <button className="link-button" style={{ color: "var(--red)" }} onClick={() => delField.mutate(f.id)}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sam-toolbar">
        <input className="control grow" placeholder="New parameter name (e.g. Warranty Expiry)" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="control" value={resp} onChange={(e) => setResp(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Responsibility…</option>
          <option value="trade">Trade</option>
          <option value="us">Us</option>
        </select>
        <button className="secondary-button" disabled={!name || addField.isPending} onClick={() => addField.mutate({ display_name: name, responsibility: resp }, { onSuccess: () => { setName(""); setResp(""); } })}>+ Add parameter</button>
      </div>
      <p className="field-note">Toggle "Show" to control which parameters appear in the Asset Management grid. "Responsibility" tracks whether a trade or we populate it, and feeds the progress metrics.</p>
    </section>
  );
}
