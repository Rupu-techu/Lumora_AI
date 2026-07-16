/**
 * lib/api.ts — Typed Axios client + all domain API helpers.
 *
 * Modules
 * -------
 *  authApi       — register / login / logout / me
 *  projectsApi   — CRUD + stats
 *  storiesApi    — CRUD under /projects/:pid/stories + AI generate
 *  charactersApi — CRUD under /projects/:pid/characters + AI backstory
 *  worldsApi     — CRUD under /projects/:pid/worlds + AI generate + expand
 *  promptsApi    — CRUD + use-counter + AI enhance
 *  graniteApi    — /generate, /generate/stream, /imagine, /models
 */

import axios from "axios";

// ─── Shared axios instance ───────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** Attach stored JWT on every request. */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("imaginex_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Redirect to /login on 401. */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("imaginex_token");
      localStorage.removeItem("imaginex_refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Shared types ────────────────────────────────────────────────────────────

export interface Pagination {
  page?: number;
  size?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string; token_type: string }>(
      "/api/auth/login",
      { email, password }
    ),

  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; token_type: string }>(
      "/api/auth/refresh",
      { refresh_token }
    ),

  logout: (refresh_token?: string) =>
    api.post("/api/auth/logout", { refresh_token }),

  me: () => api.get("/api/auth/me"),

  updateMe: (payload: { name?: string; bio?: string }) =>
    api.patch("/api/auth/me", payload),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ProjectCreate {
  name: string;
  description?: string;
  genre?: string;
  tags?: string[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  genre?: string;
  tags?: string[];
}

export const projectsApi = {
  list: (params?: Pagination & { search?: string; genre?: string }) =>
    api.get("/api/projects", { params }),

  create: (payload: ProjectCreate) =>
    api.post("/api/projects", payload),

  get: (id: string) =>
    api.get(`/api/projects/${id}`),

  update: (id: string, payload: ProjectUpdate) =>
    api.patch(`/api/projects/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/projects/${id}`),

  stats: (id: string) =>
    api.get(`/api/projects/${id}/stats`),
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export interface StoryCreate {
  title: string;
  genre?: string;
  tone?: string;
  pov?: string;
  target_length?: number;
  synopsis?: string;
}

export interface StoryGenerateRequest {
  project_id: string;
  title: string;
  genre?: string;
  tone?: string;
  pov?: string;
  target_length?: number;
  synopsis?: string;
  style_notes?: string;
}

export const storiesApi = {
  list: (projectId: string, params?: Pagination) =>
    api.get(`/api/projects/${projectId}/stories`, { params }),

  create: (projectId: string, payload: StoryCreate) =>
    api.post(`/api/projects/${projectId}/stories`, payload),

  get: (projectId: string, storyId: string) =>
    api.get(`/api/projects/${projectId}/stories/${storyId}`),

  update: (projectId: string, storyId: string, payload: Partial<StoryCreate>) =>
    api.patch(`/api/projects/${projectId}/stories/${storyId}`, payload),

  delete: (projectId: string, storyId: string) =>
    api.delete(`/api/projects/${projectId}/stories/${storyId}`),

  generate: (payload: StoryGenerateRequest) =>
    api.post("/api/stories/generate", payload),
};

// ─── Characters ───────────────────────────────────────────────────────────────

export interface CharacterCreate {
  name: string;
  role?: string;
  age?: number;
  traits?: string[];
  appearance?: string;
  motivation?: string;
  backstory?: string;
}

export interface CharacterGenerateRequest {
  project_id: string;
  name: string;
  role?: string;
  age?: number;
  traits?: string[];
  appearance?: string;
  motivation?: string;
  style_notes?: string;
}

export const charactersApi = {
  list: (projectId: string, params?: Pagination) =>
    api.get(`/api/projects/${projectId}/characters`, { params }),

  create: (projectId: string, payload: CharacterCreate) =>
    api.post(`/api/projects/${projectId}/characters`, payload),

  get: (projectId: string, characterId: string) =>
    api.get(`/api/projects/${projectId}/characters/${characterId}`),

  update: (
    projectId: string,
    characterId: string,
    payload: Partial<CharacterCreate>
  ) => api.patch(`/api/projects/${projectId}/characters/${characterId}`, payload),

  delete: (projectId: string, characterId: string) =>
    api.delete(`/api/projects/${projectId}/characters/${characterId}`),

  generateBackstory: (characterId: string, payload: CharacterGenerateRequest) =>
    api.post(`/api/characters/${characterId}/generate-backstory`, payload),
};

// ─── Worlds ───────────────────────────────────────────────────────────────────

export interface WorldCreate {
  name: string;
  genre?: string;
  climate?: string;
  magic_system?: string;
  technology_level?: string;
  overview?: string;
  history?: string;
  geography?: string;
  factions?: string;
  economy?: string;
}

export interface WorldGenerateRequest {
  project_id: string;
  name: string;
  genre?: string;
  climate?: string;
  magic_system?: string;
  technology_level?: string;
  style_notes?: string;
}

export const worldsApi = {
  list: (projectId: string, params?: Pagination) =>
    api.get(`/api/projects/${projectId}/worlds`, { params }),

  create: (projectId: string, payload: WorldCreate) =>
    api.post(`/api/projects/${projectId}/worlds`, payload),

  get: (projectId: string, worldId: string) =>
    api.get(`/api/projects/${projectId}/worlds/${worldId}`),

  update: (projectId: string, worldId: string, payload: Partial<WorldCreate>) =>
    api.patch(`/api/projects/${projectId}/worlds/${worldId}`, payload),

  delete: (projectId: string, worldId: string) =>
    api.delete(`/api/projects/${projectId}/worlds/${worldId}`),

  generate: (payload: WorldGenerateRequest) =>
    api.post("/api/worlds/generate", payload),

  expandSection: (worldId: string, section: string) =>
    api.patch(`/api/worlds/${worldId}/expand/${section}`),
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

export interface PromptCreate {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
}

export interface PromptEnhanceRequest {
  content: string;
  style?: string;
  target_model?: string;
}

export const promptsApi = {
  list: (params?: Pagination & { category?: string; search?: string }) =>
    api.get("/api/prompts", { params }),

  create: (payload: PromptCreate) =>
    api.post("/api/prompts", payload),

  get: (id: string) =>
    api.get(`/api/prompts/${id}`),

  update: (id: string, payload: Partial<PromptCreate>) =>
    api.patch(`/api/prompts/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/prompts/${id}`),

  use: (id: string) =>
    api.post(`/api/prompts/${id}/use`),

  enhance: (payload: PromptEnhanceRequest) =>
    api.post("/api/prompts/enhance", payload),
};

// ─── AI / Granite ─────────────────────────────────────────────────────────────

export interface GraniteGenerateRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export const graniteApi = {
  models: () =>
    api.get("/api/granite/models"),

  generate: (payload: GraniteGenerateRequest) =>
    api.post("/api/granite/generate", payload),

  /** Returns an EventSource URL — consume with native EventSource or a SSE lib. */
  streamUrl: (payload: GraniteGenerateRequest): string => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const params = new URLSearchParams({ prompt: payload.prompt });
    if (payload.model)       params.set("model", payload.model);
    if (payload.max_tokens)  params.set("max_tokens", String(payload.max_tokens));
    if (payload.temperature) params.set("temperature", String(payload.temperature));
    return `${base}/api/granite/generate/stream?${params.toString()}`;
  },

  /** POST then stream — use when you need to send a full body, not query params. */
  streamGenerate: (payload: GraniteGenerateRequest) =>
    api.post("/api/granite/generate/stream", payload, {
      responseType: "stream",
    }),

  imagine: (prompt: string) =>
    api.post("/api/granite/imagine", { prompt }),
};
