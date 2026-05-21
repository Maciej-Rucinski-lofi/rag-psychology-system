import type { AppSettings, DocumentListResponse, HealthResponse, SourceChunk } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const message = await errorMessage(response);
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { detail?: unknown };
    if (typeof parsed.detail === 'string') {
      return parsed.detail;
    }
  } catch {
    // Non-JSON errors can still be useful, so fall through to raw text.
  }
  return text;
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  settings: () => request<AppSettings>('/settings'),
  saveSettings: (settings: AppSettings) =>
    request<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  documents: () => request<DocumentListResponse>('/documents'),
  clearDocuments: () => request<DocumentListResponse>('/documents', { method: 'DELETE' }),
  ingest: (folderPath?: string, forceReindex = false) =>
    request<{ accepted: boolean; message: string }>('/ingest', {
      method: 'POST',
      body: JSON.stringify({ folder_path: folderPath || null, force_reindex: forceReindex }),
    }),
  chat: (question: string) =>
    request<{ answer: string; sources: SourceChunk[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};
