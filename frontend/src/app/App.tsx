import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { getTheme, toggleTheme, type ThemeMode } from "./theme";
import { useProject } from "./project";
import { useProject as useProjectQuery } from "../api/queries";

const NAV = [
  { stage: null, items: [{ label: "Home", to: "/" }] },
  { stage: "Configure", items: [{ label: "Configuration", to: "/configuration" }] },
  { stage: "Review", items: [{ label: "Overview", to: "/overview" }] },
  { stage: "Manage", items: [{ label: "Asset Management", to: "/assets" }] },
];

const TITLES: Record<string, [string, string]> = {
  "/": ["Home", "Set up a project, then populate, validate and export its asset register."],
  "/configuration": ["Configuration", "Create or select a project, define naming, load reference lists and the register template."],
  "/overview": ["Overview", "Completion and data quality across every trade register, and cross-trade conflicts."],
  "/assets": ["Asset Management", "View, edit, filter and validate each trade's asset register."],
  "/brief": ["Product brief", "What the Smart Asset Management Tool is, and how it works."],
  "/learning": ["Learning", "Role-based walkthroughs — get productive fast."],
};

export function App() {
  const location = useLocation();
  const { projectId } = useProject();
  const projectQuery = useProjectQuery(projectId);
  const [title, subtitle] = TITLES[location.pathname] ?? ["Workspace", ""];
  const projectName = projectQuery.data?.name;

  return (
    <div className="console-shell">
      <header className="app-header">
        <div className="app-brand-bar">
          <NavLink className="app-brand" to="/">
            <img className="brand-logo" src="/electracom-logo.png" alt="Electracom" />
            <span className="app-brand-divider" />
            <span className="app-brand-text">
              <span className="app-brand-title">Smart Asset Management Tool</span>
              <span className="app-brand-kind">Asset workspace</span>
            </span>
          </NavLink>
          <div className="app-header-meta">
            <span className="site-pill subtle">v0.1.1</span>
            <span className="site-pill" title="Selected project">
              {projectName ? projectName : "No project selected"}
            </span>
            <NavLink className="header-pill" to="/brief" title="What the tool is and how it works">Brief</NavLink>
            <NavLink className="header-pill" to="/learning" title="Role-based walkthroughs">Learning</NavLink>
            <ThemeToggle />
          </div>
        </div>
        <nav className="app-tabs grouped" aria-label="Sections">
          {NAV.map((group) => (
            <div className="nav-group" key={group.stage ?? "home"}>
              {group.stage ? <span className="nav-group-label">{group.stage}</span> : null}
              <div className="nav-group-items">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `app-tab${isActive ? " active" : ""}`}
                  >
                    <span className="app-tab-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>

      <section className="workspace-shell">
        <header className="page-titlebar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        <main className="page-frame">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getTheme());
  return (
    <button
      type="button"
      className="header-pill"
      onClick={() => setMode(toggleTheme())}
      title="Switch colour theme"
    >
      {mode === "dark" ? "Use light theme" : "Use dark theme"}
    </button>
  );
}
