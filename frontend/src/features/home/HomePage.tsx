import { useNavigate } from "react-router";
import { useProject } from "../../app/project";
import { useProjects, useSeedDemo, useOverview } from "../../api/queries";

const STEPS = [
  ["1", "Configure", "Create a project, set the naming convention, import reference lists and the register template."],
  ["2", "Populate", "Each trade fills its register against validated dropdowns — or imports a filled sheet."],
  ["3", "Validate", "Cross-trade duplicates, invalid references and missing fields light up on the grid, live."],
  ["4", "Export", "Produce a clean, consolidated, handover-ready register — or a validation report — on demand."],
];

export function HomePage() {
  const navigate = useNavigate();
  const { projectId, setProjectId } = useProject();
  const projects = useProjects();
  const seed = useSeedDemo();
  const overview = useOverview(projectId);

  const loadSample = () => {
    seed.mutate(undefined, {
      onSuccess: (res: any) => {
        setProjectId(res.project_id);
        navigate("/assets");
      },
    });
  };

  const list = (projects.data as any[]) ?? [];

  return (
    <div className="app-page">
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div>
            <span className="eyebrow">Smart asset workspace</span>
            <h3>Governed asset registers for smart-building projects</h3>
          </div>
        </div>
        <p className="section-copy">
          SAM replaces the per-trade Excel asset registers with one governed, validated database per
          project. Import your register as-is, populate against controlled reference lists, and see
          every cross-trade duplicate and invalid reference before handover — not after. Exports back
          to spreadsheet any time.
        </p>
        <div className="inline-actions">
          <button className="primary-button" onClick={loadSample} disabled={seed.isPending}>
            {seed.isPending ? "Loading sample…" : "Load sample project (171 Victoria Street)"}
          </button>
          <button className="secondary-button" onClick={() => navigate("/configuration")}>
            Configure a project
          </button>
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">How it works</span><h3>Four steps to a clean register</h3></div>
        </div>
        <div className="app-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
          {STEPS.map(([n, label, body]) => (
            <div className="brief-step" key={n}>
              <b>{n}</b>
              <span>{label}</span>
              <small>{body}</small>
            </div>
          ))}
        </div>
      </section>

      {projectId && overview.data ? (
        <section className="kpi-strip" style={{ marginBottom: 14 }}>
          <article><span>Total assets</span><strong>{overview.data.total_assets}</strong></article>
          <article><span>Completeness</span><strong>{overview.data.metadata_completeness}%</strong></article>
          <article className={overview.data.assets_with_errors ? "danger" : undefined}>
            <span>Assets with errors</span><strong>{overview.data.assets_with_errors}</strong>
          </article>
          <article className={overview.data.duplicate_instance_names ? "danger" : undefined}>
            <span>Cross-trade duplicates</span><strong>{overview.data.duplicate_instance_names}</strong>
          </article>
        </section>
      ) : null}

      <section className="surface">
        <div className="surface-heading">
          <div><span className="eyebrow">Projects</span><h3>Pick a project to work on</h3></div>
        </div>
        {list.length === 0 ? (
          <div className="empty-workspace">
            <strong>No projects yet</strong>
            <span>Load the sample project above, or configure a new one.</span>
          </div>
        ) : (
          <div className="run-list">
            {list.map((p) => (
              <div
                key={p.id}
                className={`brief-step sam-clickable`}
                style={{ minHeight: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", display: "flex" }}
                onClick={() => { setProjectId(p.id); navigate("/overview"); }}
              >
                <div>
                  <span>{p.name}</span>
                  <small>{p.asset_count} assets · {p.status}{projectId === p.id ? " · selected" : ""}</small>
                </div>
                <span className="status-token running">Open</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
