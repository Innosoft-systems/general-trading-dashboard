"use client";

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const API_BASE =
  runtime.process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "https://api.general-trading.uztravelagency.uz/api";

async function request<T>(
  path: string,
  init?: RequestInit,
  allowRefresh = true,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token":
        runtime.process?.env?.NEXT_PUBLIC_CSRF_TOKEN ?? "dev-csrf",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    !path.startsWith("/admin/auth/")
  ) {
    const refreshed = await fetch(`${API_BASE}/admin/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token":
          runtime.process?.env?.NEXT_PUBLIC_CSRF_TOKEN ?? "dev-csrf",
      },
    });

    if (refreshed.ok) {
      return request<T>(path, init, false);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function dashboardGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET", headers: {} });
}

export async function dashboardPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function dashboardPatch<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export async function dashboardPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function dashboardDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

export async function dashboardUploadFile(
  path: string,
  file: File,
  allowRefresh = true,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "x-csrf-token":
        runtime.process?.env?.NEXT_PUBLIC_CSRF_TOKEN ?? "dev-csrf",
    },
    body: formData,
  });

  if (response.status === 401 && allowRefresh) {
    const refreshed = await fetch(`${API_BASE}/admin/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token":
          runtime.process?.env?.NEXT_PUBLIC_CSRF_TOKEN ?? "dev-csrf",
      },
    });

    if (refreshed.ok) {
      return dashboardUploadFile(path, file, false);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Upload failed: ${path}`);
  }

  return response.json() as Promise<{
    _id?: string;
    url: string;
    filename: string;
    originalName: string;
  }>;
}
