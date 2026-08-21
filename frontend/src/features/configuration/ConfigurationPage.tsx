import { useState } from "react";
import { useProject } from "../../app/project";
import {
  useProjects, useProject as useProjectQuery, useReferences, useSchema, useTrades,
  useNaming, useSeedDemo, useCreateProject,
} from "../../api/queries";

export function ConfigurationPage() {
  const { projectId, setProjectId } = useProject();
  const projects = useProjects();
  const seed = useSeedDemo();
  const create = useCreateProject();
  const project = useProjectQuery(projectId);
  const refs = useReferences(projectId);
  const schema = useSchema(projectId);
  const trades = useTrades(projectId);
  const naming = useNaming(projectId);
  const [newName, setNewName] = useState("");

  const list = (projects.data as any[]) ?? [];
  const refCounts = (refs.data as any)?.counts ?? {};
  const refKinds = (refs.data as any)?.kinds ?? [];
  const schemaFields = (schema.data as any[]) ?? [];

  return (
    <div className="app-page">
      {/* Project select / create */}
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">Project</span><h3>Select or create a project</h3></div>
          {projectId ? <span className="status-token ready">Loaded from API</span> : null}
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Project</span>
            <select
              className="control"
              value={projectId ?? ""}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— select —</option>
              {list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Create a new project</span>
            <div className="inline-actions">
              <input className="control" placeholder="Project name" value={newName}
                onChange={(e) => setNewName(e.target.value)} />
              <button className="secondary-button" disabled={!newName || create.isPending}
                onClick={() => create.mutate({ name: newName }, {
                  onSuccess: (p: any) => { setProjectId(p.id); setNewName(""); },
                })}>Create</button>
            </div>
          </label>
        </div>
        <div className="inline-actions" style={{ marginTop: 12 }}>
          <button className="primary-button" disabled={seed.isPending}
            onClick={() => seed.mutate(undefined, { onSuccess: (r: any) => setProjectId(r.project_id) })}>
            {seed.isPending ? "Loading…" : "Load sample project"}
          </button>
        </div>
      </section>

      {!projectId ? (
        <div className="empty-workspace"><strong>No project selected</strong>
          <span>Select, create, or load the sample project above to configure it.</span></div>
      ) : (
        <>
          {/* Naming */}
          <section className="surface" style={{ marginBottom: 14 }}>
            <div className="surface-heading">
              <div><span className="eyebrow">Asset naming convention</span><h3>Naming</h3></div>
              <span className="status-token running">{project.data?.name_mode === "auto" ? "Auto-generate" : "Import / Manual"}</span>
            </div>
            <div className="field-grid">
              <label className="field"><span>Standard</span>
                <input className="control" readOnly value={project.data?.naming_standard ?? "BDNS"} /></label>
              <label className="field"><span>Site / Building reference</span>
                <input className="control" readOnly
                  value={`${project.data?.site_reference ?? ""} / ${project.data?.building_reference ?? ""}`} /></label>
            </div>
            {(naming.data as any)?.segments?.length ? (
              <>
                <div className="sam-namepreview">
                  {(naming.data as any).segments.map((s: any) => s.name).join(" · ")}
                </div>
                <p className="field-note">
                  Segments: {(naming.data as any).segments.map((s: any) =>
                    `${s.name}${s.length ? `(${s.length})` : ""}`).join(" + ")}. Names are checked
                  for uniqueness and format whether generated or imported.
                </p>
              </>
            ) : <p className="field-note">No naming scheme defined yet.</p>}
          </section>

          {/* Trades */}
          <section className="surface" style={{ marginBottom: 14 }}>
            <div className="surface-heading">
              <div><span className="eyebrow">System owners</span><h3>Trades</h3></div>
            </div>
            <div className="chip-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {((trades.data as any[]) ?? []).map((t) => (
                <span className="chip accent" key={t.id}>{t.code} · {t.asset_count}</span>
              ))}
            </div>
          </section>

          {/* Reference lists */}
          <section className="surface" style={{ marginBottom: 14 }}>
            <div className="surface-heading">
              <div><span className="eyebrow">Reference lists</span><h3>Controlled values for dropdowns &amp; validation</h3></div>
            </div>
            <div className="sam-refgrid">
              {refKinds.map((k: string) => (
                <div className="impbox" key={k}>
                  <b style={{ textTransform: "capitalize" }}>{k.replace("_", " ")}</b>
                  {refCounts[k]
                    ? <span className="chip">{refCounts[k]} loaded</span>
                    : <span className="chip amber">none</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Schema */}
          <section className="surface">
            <div className="surface-heading">
              <div><span className="eyebrow">Register schema</span><h3>Detected template parameters</h3></div>
              <span className="status-token ready">{schemaFields.length} parameters</span>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>Parameter</th><th>Requirement</th><th>Validation</th><th>Reference</th></tr></thead>
                <tbody>
                  {schemaFields.map((f: any) => (
                    <tr key={f.field_key}>
                      <td><b>{f.display_name}</b></td>
                      <td>{f.auto_generated ? "generated" : f.required}</td>
                      <td>{f.validation_type}{f.format_rule ? ` (${f.format_rule})` : ""}</td>
                      <td>{f.reference_kind || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
