import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/sct-styles.css";
import "./styles/sct-electracom-theme.css";
import "./styles/sam.css";

import { initTheme } from "./app/theme";
import { ProjectProvider } from "./app/project";
import { router } from "./app/routes";

initTheme();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <RouterProvider router={router} />
      </ProjectProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
