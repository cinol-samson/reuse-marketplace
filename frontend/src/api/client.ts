/**
 * API client: thin fetch wrapper that attaches the auth token and
 * parses the standard { error: { code, message } } error format.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

  if (!res.ok) {
    let code = 'unknown_error';
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail?.code) {
        code = body.detail.code;
        message = body.detail.message ?? message;
      } else if (body?.detail) {
        message = typeof body.detail === 'string' ? body.detail : message;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(code, message, res.status);
  }

  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function register(params: {
  email: string;
  password: string;
  display_name: string;
  is_artist: boolean;
  is_rag_picker: boolean;
}): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function login(params: { email: string; password: string }): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Users ──────────────────────────────────────────────────────────────────

export interface UserMe {
  id: number;
  email: string;
  display_name: string;
  is_artist: boolean;
  is_rag_picker: boolean;
  is_admin: boolean;
  is_discoverable: boolean;
  home_area_label: string | null;
  status: string;
  created_at: string;
}

export interface UserPublic {
  id: number;
  display_name: string;
  is_artist: boolean;
  is_rag_picker: boolean;
  is_admin: boolean;
  completed_exchanges: number;
  member_since: string;
}

export interface PatchMePayload {
  display_name?: string;
  is_artist?: boolean;
  is_rag_picker?: boolean;
  is_discoverable?: boolean;
  home_area_label?: string;
  home_lat?: number;
  home_lng?: number;
}

export function getMe(token: string): Promise<UserMe> {
  return request<UserMe>('/users/me', { token });
}

export function patchMe(token: string, payload: PatchMePayload): Promise<UserMe> {
  return request<UserMe>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function getUserPublic(userId: number): Promise<UserPublic> {
  return request<UserPublic>(`/users/${userId}`);
}
