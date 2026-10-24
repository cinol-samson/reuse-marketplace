/**
 * API client: thin fetch wrapper that attaches the auth token and
 * parses the standard { error: { code, message } } error format.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(
    code: string,
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
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

  if (res.status === 204) {
    return undefined as T;
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

// ── Items ───────────────────────────────────────────────────────────────────

export interface ItemRecord {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category_id: number;
  listing_type: 'sale' | 'donation';
  price: number | null;
  delivery_option: 'pickup' | 'shipping' | 'both';
  shipping_cost_payer: 'buyer' | 'seller' | 'split' | null;
  shipping_notes: string | null;
  lat: number | null;
  lng: number | null;
  area_label: string | null;
  photos: string[];
  status: 'available' | 'reserved' | 'completed' | 'hidden' | 'removed';
  hidden_reason: string | null;
  expires_at: string | null;
  last_activity_at: string;
  created_at: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  category_id: number;
  listing_type: 'sale' | 'donation';
  price?: number | null;
  delivery_option?: 'pickup' | 'shipping' | 'both';
  shipping_cost_payer?: 'buyer' | 'seller' | 'split' | null;
  shipping_notes?: string | null;
  lat?: number | null;
  lng?: number | null;
  area_label?: string | null;
  photos: string[];
  prohibited_items_confirmed?: boolean;
}

export function createItem(token: string, payload: CreateItemPayload): Promise<ItemRecord> {
  return request<ItemRecord>('/items', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function getMyItems(token: string): Promise<ItemRecord[]> {
  return request<ItemRecord[]>('/items/me', { token });
}

export interface ItemListFilters {
  category_id?: number;
  listing_type?: 'sale' | 'donation';
  q?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  sort?: 'newest' | 'distance';
  limit?: number;
}

export function getItems(filters: ItemListFilters = {}): Promise<ItemRecord[]> {
  const params = new URLSearchParams();

  if (filters.category_id) params.set('category_id', String(filters.category_id));
  if (filters.listing_type) params.set('listing_type', filters.listing_type);
  if (filters.q) params.set('q', filters.q);
  if (filters.lat !== undefined) params.set('lat', String(filters.lat));
  if (filters.lng !== undefined) params.set('lng', String(filters.lng));
  if (filters.radius_km !== undefined) params.set('radius_km', String(filters.radius_km));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return request<ItemRecord[]>(query ? `/items?${query}` : '/items');
}

export function getNearbyItems(
  lat: number,
  lng: number,
  radiusKm = 5,
  limit = 20,
): Promise<ItemRecord[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radiusKm),
    limit: String(limit),
  });

  return request<ItemRecord[]>(`/items/nearby?${params.toString()}`);
}

export function getItem(itemId: number): Promise<ItemRecord> {
  return request<ItemRecord>(`/items/${itemId}`);
}

export function patchItem(
  token: string,
  itemId: number,
  payload: Partial<CreateItemPayload>,
): Promise<ItemRecord> {
  return request<ItemRecord>(`/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function deleteItem(token: string, itemId: number): Promise<void> {
  return request<void>(`/items/${itemId}`, {
    method: 'DELETE',
    token,
  });
}

export function renewItem(token: string, itemId: number): Promise<ItemRecord> {
  return request<ItemRecord>(`/items/${itemId}/renew`, {
    method: 'POST',
    token,
  });
}

export function updateItemStatus(
  token: string,
  itemId: number,
  status: 'available' | 'reserved' | 'completed' | 'hidden' | 'removed',
): Promise<ItemRecord> {
  return request<ItemRecord>(`/items/${itemId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
    token,
  });
}
