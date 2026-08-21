const BASE = "/api/v1";

async function handle(res: Response) {
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail ?? detail; } catch { /* ignore */ }
    throw new Error(`${res.status}: ${detail}`);
  }
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  get: (path: string) => fetch(`${BASE}${path}`).then(handle),
  post: (path: string, body?: unknown) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(handle),
  patch: (path: string, body: unknown) =>
    fetch(`${BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  del: (path: string) => fetch(`${BASE}${path}`, { method: "DELETE" }).then(handle),
  upload: (path: string, form: FormData) =>
    fetch(`${BASE}${path}`, { method: "POST", body: form }).then(handle),
};

export function downloadUrl(path: string): string {
  return `${BASE}${path}`;
}
