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