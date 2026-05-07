// API Client for Empyrean Backend
// Handles all HTTP requests to /api/v1/

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
  } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Auth
export async function login(username: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function refreshToken(refreshToken: string) {
  return apiCall('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  });
}

// Readings
export async function getLatestReadings(token: string, nodeId?: string) {
  const params = nodeId ? `?node_id=${nodeId}` : '';
  return apiCall(`/readings/latest${params}`, { token });
}

export async function getReadingsHistory(
  token: string,
  from: string,
  to: string,
  nodeId?: string,
  bucket: string = '5m'
) {
  const params = new URLSearchParams({
    from,
    to,
    bucket,
  });
  if (nodeId) params.append('node_id', nodeId);
  
  return apiCall(`/readings/history?${params.toString()}`, { token });
}

// Nodes
export async function getAllNodes(token: string) {
  return apiCall('/nodes', { token });
}

export async function updateNode(token: string, nodeId: string, data: any) {
  return apiCall(`/nodes/${nodeId}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

// Alerts
export async function getAlerts(
  token: string,
  limit: number = 20,
  offset: number = 0,
  severity?: string
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (severity) params.append('severity', severity);

  return apiCall(`/alerts?${params.toString()}`, { token });
}

export async function acknowledgeAlert(token: string, alertId: string) {
  return apiCall(`/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
    token,
  });
}

// Forecast
export async function getForecast(token: string, nodeId?: string) {
  const params = nodeId ? `?node_id=${nodeId}` : '';
  return apiCall(`/forecast${params}`, { token });
}

// Export
export async function exportCSV(token: string, from: string, to: string, nodeId?: string) {
  const params = new URLSearchParams({ from, to });
  if (nodeId) params.append('node_id', nodeId);
  
  return apiCall(`/export?${params.toString()}`, { token });
}
