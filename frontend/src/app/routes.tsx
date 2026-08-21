import { createHashRouter } from "react-router";
import { App } from "./App";
import { HomePage } from "../features/home/HomePage";
import { ConfigurationPage } from "../features/configuration/ConfigurationPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { AssetManagementPage } from "../features/assets/AssetManagementPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "configuration", element: <ConfigurationPage /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "assets", element: <AssetManagementPage /> },
    ],
  },
]);
