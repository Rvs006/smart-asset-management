import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export type SchemaField = {
  field_key: string; display_name: string; required: string; validation_type: string;
  reference_kind: string; visible: number; export_order: number; auto_generated: number;
  editable: number; conditional_expr: string; format_rule: string;
};
export type Issue = {
  asset_id: number | null; field_key: string; severity: string; rule: string;
  message: string; expected: string; instance_name?: string; trade_code?: string;
};
export type Asset = {
  id: number; trade_id: number; trade_code: string; instance_name: string;
  source: string; metadata: Record<string, any>; issues: Issue[];
};

export const useProjects = () =>
  useQuery({ queryKey: ["projects"], queryFn: () => api.get("/projects") });

export const useProject = (pid: number | null) =>
  useQuery({ queryKey: ["project", pid], queryFn: () => api.get(`/projects/${pid}`), enabled: !!pid });

export const useOverview = (pid: number | null) =>
  useQuery({ queryKey: ["overview", pid], queryFn: () => api.get(`/projects/${pid}/overview`), enabled: !!pid });

export const useSchema = (pid: number | null) =>
  useQuery<SchemaField[]>({ queryKey: ["schema", pid], queryFn: () => api.get(`/projects/${pid}/schema`), enabled: !!pid });

export const useTrades = (pid: number | null) =>
  useQuery({ queryKey: ["trades", pid], queryFn: () => api.get(`/projects/${pid}/trades`), enabled: !!pid });

export const useReferences = (pid: number | null) =>
  useQuery({ queryKey: ["references", pid], queryFn: () => api.get(`/projects/${pid}/references`), enabled: !!pid });

export const useReferenceValues = (pid: number | null, kind: string | null) =>
  useQuery({
    queryKey: ["references", pid, kind],
    queryFn: () => api.get(`/projects/${pid}/references?kind=${kind}`),
    enabled: !!pid && !!kind,
  });

export const useNaming = (pid: number | null) =>
  useQuery({ queryKey: ["naming", pid], queryFn: () => api.get(`/projects/${pid}/naming`), enabled: !!pid });

export const useAssets = (pid: number | null, trade: string | null, search: string) =>
  useQuery<Asset[]>({
    queryKey: ["assets", pid, trade, search],
    queryFn: () => {
      const p = new URLSearchParams();
      if (trade) p.set("trade", trade);
      if (search) p.set("search", search);
      return api.get(`/projects/${pid}/assets?${p.toString()}`);
    },
    enabled: !!pid,
  });

export const useIssues = (pid: number | null, trade: string | null) =>
  useQuery<Issue[]>({
    queryKey: ["issues", pid, trade],
    queryFn: () => api.get(`/projects/${pid}/issues${trade ? `?trade=${trade}` : ""}`),
    enabled: !!pid,
  });

export function useInvalidateProject(pid: number | null) {
  const qc = useQueryClient();
  return () => {
    for (const key of ["assets", "issues", "overview", "trades", "schema", "references", "naming"]) {
      qc.invalidateQueries({ queryKey: [key, pid] });
    }
  };
}

export function useSeedDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/seed-demo"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function usePatchAsset(pid: number | null) {
  const invalidate = useInvalidateProject(pid);
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api.patch(`/projects/${pid}/assets/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useGenerateNames(pid: number | null) {
  const invalidate = useInvalidateProject(pid);
  return useMutation({
    mutationFn: (body: any) => api.post(`/projects/${pid}/assets/generate-names`, body),
    onSuccess: invalidate,
  });
}

export function useImportAssets(pid: number | null) {
  const invalidate = useInvalidateProject(pid);
  return useMutation({
    mutationFn: (form: FormData) => api.upload(`/projects/${pid}/assets/import`, form),
    onSuccess: invalidate,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post("/projects", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
