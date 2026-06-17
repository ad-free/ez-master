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

// Timecard Calendar types
export interface CalendarEventStyle {
  Text: string;
  Border: string;
  Background: string;
  TypeTimeCard: number;
  EventStatus: string | null;
}

export interface CalendarEvent {
  Type: number;
  Style: CalendarEventStyle;
  Date: string;
  Title: string;
  TypeShift: number;
  Index: number;
}

export interface CalendarDayData {
  Date: string;
  Data: CalendarEvent[];
}

// Ticket types returned by backend GetTicketsResponse
export interface Ticket {
  ticket_id: string;
  owner: string;
  status: string;
  reason: string;
  approver: string;
  created_at?: string;
}

