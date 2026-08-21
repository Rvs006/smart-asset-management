import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useProject } from "../../app/project";
import {
  useAssets, useIssues, useSchema, useTrades, usePatchAsset, useGenerateNames,
  useImportAssets, useReferenceValues, type Asset, type SchemaField,
} from "../../api/queries";
import { downloadUrl } from "../../api/client";

export function AssetManagementPage() {
  const { projectId } = useProject();
  const [params, setParams] = useSearchParams();
  const trades = useTrades(projectId);
  const tradeList = (trades.data as any[]) ?? [];
  const trade = params.get("trade") ?? tradeList[0]?.code ?? null;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"details" | "validation">("details");

  const schema = useSchema(projectId);
  const assets = useAssets(projectId, trade, search);
  const issues = useIssues(projectId, trade);
  const patch = usePatchAsset(projectId);
  const gen = useGenerateNames(projectId);
  const importAssets = useImportAssets(projectId);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  // reference option lists (fixed set of kinds)
  const levels = useReferenceValues(projectId, "level");
  const spaces = useReferenceValues(projectId, "space");
  const systems = useReferenceValues(projectId, "system");
  const zones = useReferenceValues(projectId, "zone");
  const equip = useReferenceValues(projectId, "equipment_type");
  const optionsFor = (kind: string): string[] => {
    const src: any = { level: levels, space: spaces, system: systems, zone: zones, equipment_type: equip }[kind];
    return ((src?.data as any[]) ?? []).map((r) => r.code);
  };

  const cols = useMemo(
    () => ((schema.data as SchemaField[]) ?? []).filter((f) => f.visible && f.field_key !== "instance_name"),
    [schema.data],
  );
  const rows = (assets.data as Asset[]) ?? [];
  const selected = rows.find((a) => a.id === selectedId) ?? null;

  useEffect(() => { setSelectedId(null); }, [trade]);

  const setTrade = (code: string) => setParams(code ? { trade: code } : {});
  const savingCell = (a: Asset, key: string, value: string) => {
    if (key === "instance_name") patch.mutate({ id: a.id, body: { instance_name: value } });
    else patch.mutate({ id: a.id, body: { metadata: { [key]: value } } });
  };
  const openAsset = (id: number) => {
    setSelectedId(id);
    rowRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const tradeMeta = tradeList.find((t) => t.code === trade);
  const errorCount = rows.filter((r) => r.issues.some((i) => i.severity === "error")).length;
  const dupCount = rows.filter((r) => r.issues.some((i) => i.rule === "duplicate_instance_name")).length;
  const completeness = tradeMeta ? undefined : undefined;

  if (!projectId) {
    return <div className="empty-workspace"><strong>No project selected</strong>
      <span>Pick a project on the Home or Configuration page.</span></div>;
  }

  const issueFor = (a: Asset, key: string) =>
    a.issues.find((i) => i.field_key === key);

  return (
    <div className="app-page">
      {/* trade KPIs */}
      <section className="kpi-strip" style={{ marginBottom: 14 }}>
        <article><span>Selected trade</span><strong style={{ fontSize: 18 }}>{trade ?? "—"}</strong></article>
        <article><span>Assets</span><strong>{rows.length}</strong></article>
        <article className={errorCount ? "danger" : undefined}><span>Assets with errors</span><strong>{errorCount}</strong></article>
        <article className={dupCount ? "danger" : undefined}><span>Duplicate names</span><strong>{dupCount}</strong></article>
      </section>

      {/* toolbar */}
      <section className="surface" style={{ marginBottom: 14 }}>
        <div className="sam-toolbar">
          <select className="control" style={{ maxWidth: 200 }} value={trade ?? ""}
            onChange={(e) => setTrade(e.target.value)}>
            {tradeList.map((t) => <option key={t.code} value={t.code}>{t.code} ({t.asset_count})</option>)}
          </select>
          <input className="control grow" placeholder="Search instance name, level, room, manufacturer…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <label className="secondary-button" style={{ cursor: "pointer" }}>
            {importAssets.isPending ? "Importing…" : "Import"}
            <input type="file" accept=".csv,.xlsx" style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f || !tradeMeta) return;
                const form = new FormData();
                form.append("file", f); form.append("trade_id", String(tradeMeta.id)); form.append("mode", "create");
                importAssets.mutate(form);
                e.target.value = "";
              }} />
          </label>
          <a className="secondary-button" href={downloadUrl(`/projects/${projectId}/export${tradeMeta ? `?trade=${tradeMeta.id}` : ""}`)}>Export</a>
          <button className="secondary-button" disabled={gen.isPending}
            onClick={() => tradeMeta && gen.mutate({ trade_id: tradeMeta.id, only_blank: true })}>
            {gen.isPending ? "Generating…" : "Generate names"}
          </button>
        </div>

        {/* grid */}
        <div className="data-table-wrap results-scroll">
          <table className="data-table sam-grid">
            <thead>
              <tr>
                <th>Instance Name</th>
                {cols.map((c) => <th key={c.field_key}>{c.display_name}</th>)}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const rowError = a.issues.some((i) => i.severity === "error");
                const nameIssue = issueFor(a, "instance_name");
                return (
                  <tr key={a.id} ref={(el) => { rowRefs.current[a.id] = el; }}
                    className={selectedId === a.id ? "selected sam-clickable" : "sam-clickable"}
                    onClick={() => setSelectedId(a.id)}>
                    <td className={nameIssue ? "cell-bad" : ""}>
                      <input className="cell-input id-main" defaultValue={a.instance_name}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => e.target.value !== a.instance_name && savingCell(a, "instance_name", e.target.value)} />
                      <span className="id-sub">{a.metadata.asset_description ?? ""}</span>
                    </td>
                    {cols.map((c) => {
                      const iss = issueFor(a, c.field_key);
                      const cls = iss ? (iss.severity === "error" ? "cell-bad" : "cell-warn") : "";
                      const val = a.metadata[c.field_key] ?? "";
                      const isRef = c.validation_type === "reference" && c.reference_kind;
                      return (
                        <td key={c.field_key} className={cls} onClick={(e) => e.stopPropagation()}>
                          {isRef ? (
                            <select className="cell-select" defaultValue={String(val)}
                              onChange={(e) => savingCell(a, c.field_key, e.target.value)}>
                              <option value="">—</option>
                              {[String(val), ...optionsFor(c.reference_kind)]
                                .filter((v, i, arr) => v && arr.indexOf(v) === i)
                                .map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input className="cell-input" defaultValue={String(val)}
                              onBlur={(e) => e.target.value !== String(val) && savingCell(a, c.field_key, e.target.value)} />
                          )}
                        </td>
                      );
                    })}
                    <td><span className={`status-token ${rowError ? "failed" : "ready"}`}>{rowError ? "Error" : "Valid"}</span></td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr><td colSpan={cols.length + 2}>
                  <div className="empty-workspace"><strong>No assets</strong>
                    <span>Import a sheet for this trade, or load the sample project.</span></div>
                </td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* selected-asset detail */}
      {selected ? (
        <section className="surface" style={{ marginBottom: 14 }}>
          <div className="surface-heading">
            <div><span className="eyebrow">Selected asset</span><h3>{selected.instance_name || "(unnamed)"}</h3></div>
            <span className={`status-token ${selected.issues.some((i) => i.severity === "error") ? "failed" : "ready"}`}>
              {selected.issues.length ? `${selected.issues.length} issues` : "Validated"}</span>
          </div>
          <div className="inline-actions" style={{ marginBottom: 12 }}>
            <button className={`secondary-button compact${tab === "details" ? " selected" : ""}`} onClick={() => setTab("details")}>Details</button>
            <button className={`secondary-button compact${tab === "validation" ? " selected" : ""}`} onClick={() => setTab("validation")}>Validation</button>
          </div>
          {tab === "details" ? (
            <div className="sam-detail-grid">
              {cols.map((c) => (
                <div key={c.field_key}><span>{c.display_name}</span>
                  <b>{String(selected.metadata[c.field_key] ?? "—") || "—"}</b></div>
              ))}
            </div>
          ) : (
            selected.issues.length ? selected.issues.map((i, n) => (
              <div className="state-panel error" key={n} style={{ marginBottom: 8 }}>
                <strong>{i.field_key || i.rule}</strong><span>{i.message}</span>
              </div>
            )) : <div className="state-panel success"><strong>No validation issues</strong><span>This asset passes every rule.</span></div>
          )}
        </section>
      ) : null}

      {/* fault list */}
      <section className="surface">
        <div className="surface-heading">
          <div><span className="eyebrow">Faults</span><h3>Validation issues in {trade}</h3></div>
        </div>
        {(issues.data ?? []).length === 0 ? (
          <div className="state-panel success"><strong>No issues in this trade</strong><span>Every asset passes validation.</span></div>
        ) : (
          <div>
            {(issues.data ?? []).map((i, n) => (
              <div className="sam-fault-row" key={n}>
                <b className="id-main">{i.instance_name ?? "—"}</b>
                <span>{i.message}</span>
                <span className={`status-token ${i.severity === "error" ? "failed" : "queued"}`}>{i.severity}</span>
                <button className="secondary-button compact"
                  onClick={() => i.asset_id && openAsset(i.asset_id)}>Open asset</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
