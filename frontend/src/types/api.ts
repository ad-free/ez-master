// API Types matching the FastAPI backend schemas

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ProfileResponse {
  ID: string;
  Email: string;
  LastName: string;
  FirstName: string;
  ChucVu: string;
  ChucDanh: string;
  PhongBan: string;
}

export interface RegisterWFHRequest {
  from_date: string;
  to_date: string;
  reason?: string;
}

export interface RegisterOTRequest extends RegisterWFHRequest {
  from_time: string;
  to_time: string;
  ot_type: 'PLAN' | 'ADDITIONAL';
  ot_benefit_type: 'DILIGENCE' | 'COMPENSATION' | 'SALARY';
}

export interface ApiResponse<T = any> {
  status: string;
  user_id?: string;
  dates?: string[];
  data?: T;
}

export interface ApiError {
  detail: string;
}

// Force Vite refresh - cache issue fix

// Ticket types returned by backend GetTicketsResponse
export interface Ticket {
  ticket_id: string;
  owner: string;
  status: string;
  reason: string;
  approver: string;
  created_at?: string;
}

// Connectivity (/connections)
export interface ConnectionsRequest {
  hosts?: string[];
  include_default?: boolean;
  port?: number;
  timeout_s?: number;
}

export interface ConnectionResult {
  host: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE' | string;
  latency_ms?: number | null;
  error?: string | null;
}

export interface ConnectionsResponse {
  checked_at: string;
  port: number;
  timeout_s: number;
  results: ConnectionResult[];
  best: ConnectionResult[];
}
