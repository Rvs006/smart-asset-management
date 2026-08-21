import { createContext, useContext, useState, type ReactNode } from "react";

type Ctx = {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
};

const ProjectContext = createContext<Ctx>({ projectId: null, setProjectId: () => {} });
const KEY = "sam.project";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setId] = useState<number | null>(() => {
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  });
  const setProjectId = (id: number | null) => {
    if (id) localStorage.setItem(KEY, String(id));
    else localStorage.removeItem(KEY);
    setId(id);
  };
  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
