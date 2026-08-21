import { useNavigate } from "react-router";
import { useProject } from "../../app/project";
import { useOverview } from "../../api/queries";
import { downloadUrl } from "../../api/client";

export function OverviewPage() {
  const { projectId } = useProject();
  const navigate = useNavigate();
  const overview = useOverview(projectId);

  if (!projectId) {
    return <div className="empty-workspace"><strong>No project selected</strong>
      <span>Pick a project on the Home or Configuration page.</span></div>;
  }
  if (overview.isLoading || !overview.data) {
    return <div className="empty-workspace"><strong>Loading overview…</strong><span>Reading project metrics.</span></div>;
  }
  const d = overview.data;

  return (
    <div className="app-page">
      <section className="kpi-strip" style={{ marginBottom: 14 }}>
        <article><span>Total assets</span><strong>{d.total_assets}</strong></article>
        <article><span>Metadata completeness</span><strong>{d.metadata_completeness}%</strong></article>
        <article className={d.assets_with_errors ? "danger" : undefined}>
          <span>Assets with errors</span><strong>{d.assets_with_errors}</strong></article>
        <article className={d.duplicate_instance_names ? "danger" : undefined}>
          <span>Cross-trade duplicates</span><strong>{d.duplicate_instance_names}</strong></article>
      </section>

      <section className="kpi-strip" style={{ marginBottom: 14 }}>
        <article><span>Naming compliant</span><strong>{d.naming_compliant}</strong></article>
        <article className={d.missing_mandatory ? "danger" : undefined}>
          <span>Missing mandatory</span><strong>{d.missing_mandatory}</strong></article>
        <article><span>QR required</span><strong>{d.qr_required}</strong></article>
        <article><span>Last update</span><strong style={{ fontSize: 14 }}>{d.last_update ?? "—"}</strong></article>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">Trades</span><h3>Register progress</h3></div>
        </div>
        <div className="app-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }}>
          {d.trades.map((t: any) => (
            <div className="surface sam-clickable" key={t.code}
              style={{ padding: 15 }} onClick={() => navigate(`/assets?trade=${t.code}`)}>
              <div className="surface-heading" style={{ marginBottom: 8 }}>
                <div><h3 style={{ fontSize: 15 }}>{t.code}</h3>
                  <span className="field-note">{t.count} assets</span></div>
                <span className={`status-token ${t.issues ? "queued" : "ready"}`}>
                  {t.issues ? `${t.issues} issues` : "clean"}</span>
              </div>
              <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 980 }}>
                <div style={{ width: `${t.completeness}%`, height: 6, background: "var(--accent)", borderRadius: 980 }} />
              </div>
              <span className="field-note">{t.completeness}% complete</span>
            </div>
          ))}
        </div>
      </section>

      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="surface-heading">
          <div><span className="eyebrow">Cross-trade checks</span><h3>Duplicate Instance Names across trades</h3></div>
        </div>
        {d.cross_trade_duplicates.length === 0 ? (
          <div className="state-panel success"><strong>No cross-trade duplicates</strong>
            <span>Every Instance Name is unique across the project.</span></div>
        ) : (
          <div>
            {d.cross_trade_duplicates.map((c: any) => (
              <div className="sam-fault-row" key={c.instance_name}>
                <b className="id-main">{c.instance_name}</b>
                <span>Appears in {c.trades.join(" ↔ ")}</span>
                <span className="status-token failed">duplicate</span>
                <button className="secondary-button compact"
                  onClick={() => navigate(`/assets?trade=${c.trades[0]}`)}>Open</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="inline-actions">
        <a className="secondary-button" href={downloadUrl(`/projects/${projectId}/export`)}>Export register (CSV)</a>
        <a className="secondary-button" href={downloadUrl(`/projects/${projectId}/export/issues`)}>Export validation issues (CSV)</a>
      </section>
    </div>
  );
}
