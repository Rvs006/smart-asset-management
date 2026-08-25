import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useProject } from "../../app/project";
import { Info } from "../../app/Info";
import {
  useAssets, useIssues, useSchema, useTrades, usePatchAsset, useGenerateNames,
  useImportAssets, useReferenceValues, useBulkDelete, useCreateAsset, useAudit, useOverview,
  type Asset, type SchemaField,
} from "../../api/queries";
import { downloadUrl } from "../../api/client";

type StatusFilter = "all" | "error" | "warning" | "valid";

export function AssetManagementPage() {
  const { projectId } = useProject();
  const [params, setParams] = useSearchParams();
  const trades = useTrades(projectId);
  const tradeList = (trades.data as any[]) ?? [];
  const trade = params.get("trade") ?? tradeList[0]?.code ?? null;
  const tradeMeta = tradeList.find((t) => t.code === trade);
  const overview = useOverview(projectId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"details" | "validation" | "history">("details");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [showCols, setShowCols] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");

  const schema = useSchema(projectId);
  const assets = useAssets(projectId, trade, search);
  const issues = useIssues(projectId, trade);
  const patch = usePatchAsset(projectId);
  const gen = useGenerateNames(projectId);
  const importAssets = useImportAssets(projectId);
  const bulkDelete = useBulkDelete(projectId);
  const createAsset = useCreateAsset(projectId);
  const audit = useAudit(projectId, tab === "history" ? selectedId : null);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const levels = useReferenceValues(projectId, "level");
  const spaces = useReferenceValues(projectId, "space");
  const systems = useReferenceValues(projectId, "system");
  const zones = useReferenceValues(projectId, "zone");
  const equip = useReferenceValues(projectId, "equipment_type");
  const optionsFor = (kind: string): string[] => {
    const src: any = { level: levels, space: spaces, system: systems, zone: zones, equipment_type: equip }[kind];
    return ((src?.data as any[]) ?? []).map((r) => r.code);
  };

  const allCols = useMemo(
    () => ((schema.data as SchemaField[]) ?? []).filter((f) => f.visible && f.field_key !== "instance_name"),
    [schema.data],
  );
  const cols = allCols.filter((c) => !hiddenCols.has(c.field_key));
  const allRows = (assets.data as Asset[]) ?? [];

  const valOf = (a: Asset, key: string) => key === "instance_name" ? a.instance_name : (a.metadata[key] ?? "");
  let rows = allRows.filter((a) => {
    if (statusFilter !== "all") {
      const hasErr = a.issues.some((i) => i.severity === "error");
      const hasWarn = a.issues.some((i) => i.severity === "warning");
      if (statusFilter === "error" && !hasErr) return false;
      if (statusFilter === "warning" && !(hasWarn && !hasErr)) return false;
      if (statusFilter === "valid" && a.issues.length) return false;
    }
    for (const [k, v] of Object.entries(colFilters)) {
      if (v && !String(valOf(a, k)).toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  });
  if (sortKey) {
    const k = sortKey;
    rows = [...rows].sort((a, b) => {
      const va = String(valOf(a, k)), vb = String(valOf(b, k));
      const na = Number(va), nb = Number(vb);
      const cmp = (!isNaN(na) && !isNaN(nb) && va !== "" && vb !== "") ? na - nb : va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }
  const selected = allRows.find((a) => a.id === selectedId) ?? null;

  useEffect(() => { setSelectedId(null); setChecked(new Set()); }, [trade]);

  const setTrade = (code: string) => setParams(code ? { trade: code } : {});
  const savingCell = (a: Asset, key: string, value: string) => {
    if (key === "instance_name") patch.mutate({ id: a.id, body: { instance_name: value } });
    else patch.mutate({ id: a.id, body: { metadata: { [key]: value } } });
  };
  const openAsset = (id: number) => { setSelectedId(id); setTab("details"); rowRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" }); };
  const toggleCheck = (id: number) => setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setChecked((s) => s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)));
  const sortBy = (key: string) => { if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const arrow = (key: string) => sortKey === key ? <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  const errorCount = allRows.filter((r) => r.issues.some((i) => i.severity === "error")).length;
  const dupCount = allRows.filter((r) => r.issues.some((i) => i.rule.startsWith("duplicate"))).length;
  const issueFor = (a: Asset, key: string) => a.issues.find((i) => i.field_key === key);
  const ov = overview.data;
  const tradeComplete = ov?.trades?.find((t: any) => t.code === trade)?.completeness;
  const resp = ov?.responsibility;

  if (!projectId) {
    return <div className="empty-workspace"><strong>No project selected</strong><span>Pick a project on the Home or Configuration page.</span></div>;
  }

  return (
    <div className="app-page">
      {/* #5 trade tabs */}
      <div className="sam-trade-tabs">
        {tradeList.map((t) => (
          <button key={t.code} className={`sam-trade-tab${t.code === trade ? " active" : ""}`} onClick={() => setTrade(t.code)}>
            {t.code}<span className="count">{t.asset_count}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <section className="kpi-strip" style={{ marginBottom: 14 }}>
        <article><span>Selected trade</span><strong style={{ fontSize: 18 }}>{trade ?? "—"}</strong></article>
        <article><span>Assets</span><strong>{allRows.length}</strong></article>
        <article className={errorCount ? "danger" : undefined}><span>With errors</span><strong>{errorCount}</strong></article>
        <article className={dupCount ? "danger" : undefined}><span>Duplicate names<Info text="Instance Names checked for uniqueness across every trade in the project." /></span><strong>{dupCount}</strong></article>
      </section>
      {/* #6 more metrics */}
      <section className="kpi-strip" style={{ marginBottom: 14 }}>
        <article><span>Trade complete %<Info text="Share of applicable required parameters populated for this trade." /></span><strong>{tradeComplete ?? "—"}%</strong></article>
        <article><span>Project complete %</span><strong>{ov?.metadata_completeness ?? "—"}%</strong></article>
        <article><span>Trade-owned populated<Info text="For parameters marked as the trade's responsibility (set on the Configuration page), how much is filled." /></span><strong>{resp?.trade?.pct ?? "—"}%</strong></article>
        <article><span>Our-owned populated</span><strong>{resp?.us?.pct ?? "—"}%</strong></article>
      </section>

      <section className={`surface${expanded ? " sam-expanded" : ""}`} style={{ marginBottom: 14 }}>
        <div className="sam-toolbar">
          <select className="control" style={{ maxWidth: 150 }} value={trade ?? ""} onChange={(e) => setTrade(e.target.value)}>
            {tradeList.map((t) => <option key={t.code} value={t.code}>{t.code} ({t.asset_count})</option>)}
          </select>
          <input className="control grow" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="control" style={{ maxWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">All statuses</option><option value="error">Errors</option><option value="warning">Warnings</option><option value="valid">Valid</option>
          </select>
          <button className={`secondary-button${showFilters ? " selected" : ""}`} onClick={() => setShowFilters((v) => !v)}>Filters</button>
          <button className={`secondary-button${showCols ? " selected" : ""}`} onClick={() => setShowCols((v) => !v)}>Columns</button>
          <label className="secondary-button" style={{ cursor: "pointer" }}>
            {importAssets.isPending ? "Importing…" : "Import"}
            <input type="file" accept=".csv,.xlsx" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (!f || !tradeMeta) return; const form = new FormData(); form.append("file", f); form.append("trade_id", String(tradeMeta.id)); form.append("mode", "create"); importAssets.mutate(form); e.target.value = ""; }} />
          </label>
          <a className="secondary-button" href={downloadUrl(`/projects/${projectId}/export?format=xlsx${tradeMeta ? `&trade=${tradeMeta.id}` : ""}`)}>Export XLSX</a>
          <button className="secondary-button" disabled={gen.isPending} onClick={() => tradeMeta && gen.mutate({ trade_id: tradeMeta.id, only_blank: true })}>{gen.isPending ? "Generating…" : "Generate names"}</button>
          <button className={`secondary-button${expanded ? " selected" : ""}`} onClick={() => setExpanded((v) => !v)}>{expanded ? "Collapse" : "Expand"}</button>
          <button className="primary-button" onClick={() => setShowAdd((v) => !v)}>+ Add Asset</button>
        </div>

        {showCols ? (
          <div className="state-panel" style={{ marginBottom: 12 }}>
            <strong style={{ marginBottom: 8 }}>Show columns</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
              {allCols.map((c) => (
                <label key={c.field_key} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12 }}>
                  <input type="checkbox" checked={!hiddenCols.has(c.field_key)} onChange={() => setHiddenCols((s) => { const n = new Set(s); n.has(c.field_key) ? n.delete(c.field_key) : n.add(c.field_key); return n; })} />
                  {c.display_name}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {showAdd ? (
          <div className="state-panel" style={{ marginBottom: 12 }}>
            <strong style={{ marginBottom: 8 }}>Add asset to {trade}</strong>
            <div className="sam-toolbar">
              <input className="control" placeholder="Instance Name (or blank + generate)" value={addName} onChange={(e) => setAddName(e.target.value)} />
              <input className="control grow" placeholder="Asset description" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
              <button className="primary-button" disabled={createAsset.isPending || !tradeMeta} onClick={() => tradeMeta && createAsset.mutate({ trade_id: tradeMeta.id, instance_name: addName, metadata: { asset_description: addDesc, contractor_name: "Electracom" } }, { onSuccess: () => { setAddName(""); setAddDesc(""); setShowAdd(false); } })}>Create</button>
              <button className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        ) : null}

        {checked.size > 0 ? (
          <div className="inline-actions" style={{ marginBottom: 12 }}>
            <span className="chip accent">{checked.size} selected</span>
            <button className="secondary-button compact destructive" disabled={bulkDelete.isPending} onClick={() => { if (confirm(`Delete ${checked.size} asset(s)?`)) bulkDelete.mutate([...checked], { onSuccess: () => setChecked(new Set()) }); }}>Delete selected</button>
          </div>
        ) : null}

        <div className="data-table-wrap results-scroll">
          <table className="data-table sam-grid">
            <thead>
              <tr>
                <th><input type="checkbox" checked={rows.length > 0 && checked.size === rows.length} onChange={toggleAll} /></th>
                <th className="sortable" onClick={() => sortBy("instance_name")}>Instance Name{arrow("instance_name")}</th>
                {cols.map((c) => <th key={c.field_key} className="sortable" onClick={() => sortBy(c.field_key)}>{c.display_name}{arrow(c.field_key)}</th>)}
                <th>Status</th>
              </tr>
              {showFilters ? (
                <tr className="filter-row">
                  <td></td>
                  <td><input placeholder="filter" value={colFilters.instance_name ?? ""} onChange={(e) => setColFilters((f) => ({ ...f, instance_name: e.target.value }))} /></td>
                  {cols.map((c) => <td key={c.field_key}><input placeholder="filter" value={colFilters[c.field_key] ?? ""} onChange={(e) => setColFilters((f) => ({ ...f, [c.field_key]: e.target.value }))} /></td>)}
                  <td></td>
                </tr>
              ) : null}
            </thead>
            <tbody>
              {rows.map((a) => {
                const rowError = a.issues.some((i) => i.severity === "error");
                const rowWarn = a.issues.some((i) => i.severity === "warning");
                const nameIssue = issueFor(a, "instance_name");
                return (
                  <tr key={a.id} ref={(el) => { rowRefs.current[a.id] = el; }} className={selectedId === a.id ? "selected sam-clickable" : "sam-clickable"} onClick={() => { setSelectedId(a.id); setTab("details"); }}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={checked.has(a.id)} onChange={() => toggleCheck(a.id)} /></td>
                    <td className={nameIssue ? "cell-bad" : ""}>
                      <input className="cell-input id-main" defaultValue={a.instance_name} onClick={(e) => e.stopPropagation()} onBlur={(e) => e.target.value !== a.instance_name && savingCell(a, "instance_name", e.target.value)} />
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
                            <select className="cell-select" defaultValue={String(val)} onChange={(e) => savingCell(a, c.field_key, e.target.value)}>
                              <option value="">—</option>
                              {[String(val), ...optionsFor(c.reference_kind)].filter((v, i, arr) => v && arr.indexOf(v) === i).map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input className="cell-input" defaultValue={String(val)} onBlur={(e) => e.target.value !== String(val) && savingCell(a, c.field_key, e.target.value)} />
                          )}
                        </td>
                      );
                    })}
                    <td><span className={`status-token ${rowError ? "failed" : rowWarn ? "queued" : "ready"}`}>{rowError ? "Error" : rowWarn ? "Warning" : "Valid"}</span></td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr><td colSpan={cols.length + 3}><div className="empty-workspace"><strong>No assets match</strong><span>{allRows.length ? "Adjust the filters or search." : "Import a sheet or load the sample project."}</span></div></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="field-note" style={{ marginTop: 10 }}>Showing {rows.length} of {allRows.length} assets. Click a column header to sort; use Filters for per-column search.</p>
      </section>

      {selected ? (
        <section className="surface" style={{ marginBottom: 14 }}>
          <div className="surface-heading">
            <div><span className="eyebrow">Selected asset</span><h3>{selected.instance_name || "(unnamed)"}</h3></div>
            <span className={`status-token ${selected.issues.some((i) => i.severity === "error") ? "failed" : "ready"}`}>{selected.issues.length ? `${selected.issues.length} issues` : "Validated"}</span>
          </div>
          <div className="inline-actions" style={{ marginBottom: 12 }}>
            {(["details", "validation", "history"] as const).map((t) => (
              <button key={t} className={`secondary-button compact${tab === t ? " selected" : ""}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
          {tab === "details" ? (
            <div className="sam-detail-grid">{allCols.map((c) => (<div key={c.field_key}><span>{c.display_name}</span><b>{String(selected.metadata[c.field_key] ?? "—") || "—"}</b></div>))}</div>
          ) : tab === "validation" ? (
            selected.issues.length ? selected.issues.map((i, n) => (<div className="state-panel error" key={n} style={{ marginBottom: 8 }}><strong>{i.field_key || i.rule}</strong><span>{i.message}</span></div>)) : <div className="state-panel success"><strong>No validation issues</strong><span>This asset passes every rule.</span></div>
          ) : (
            audit.isLoading ? <div className="field-note">Loading history…</div> : ((audit.data as any[]) ?? []).length ? ((audit.data as any[]).map((e, n) => (<div className="sam-fault-row" key={n} style={{ gridTemplateColumns: "120px 1fr auto" }}><b className="id-main">{e.action}</b><span>{e.after ? String(e.after).slice(0, 120) : e.before ? String(e.before).slice(0, 120) : ""}</span><span className="field-note">{e.at}</span></div>))) : <div className="state-panel"><strong>No history yet</strong><span>Edits, imports and deletes for this asset appear here.</span></div>
          )}
        </section>
      ) : null}

      <section className="surface">
        <div className="surface-heading">
          <div><span className="eyebrow">Faults</span><h3>Validation issues in {trade}</h3></div>
          <a className="link-button" href={downloadUrl(`/projects/${projectId}/export/issues?format=xlsx`)}>Export issues (XLSX)</a>
        </div>
        {(issues.data ?? []).length === 0 ? (
          <div className="state-panel success"><strong>No issues in this trade</strong><span>Every asset passes validation.</span></div>
        ) : (
          <div>{(issues.data ?? []).map((i, n) => (<div className="sam-fault-row" key={n}><b className="id-main">{i.instance_name ?? "—"}</b><span>{i.message}</span><span className={`status-token ${i.severity === "error" ? "failed" : "queued"}`}>{i.severity}</span><button className="secondary-button compact" onClick={() => i.asset_id && openAsset(i.asset_id)}>Open asset</button></div>))}</div>
        )}
      </section>
    </div>
  );
}
