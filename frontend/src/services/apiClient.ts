import axios from 'axios';

// Define types locally to avoid import issues
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
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

interface RegisterWFHRequest {
  from_date: string;
  to_date: string;
  reason?: string;
}

interface RegisterOTRequest extends RegisterWFHRequest {
  from_time: string;
  to_time: string;
  ot_type: 'PLAN' | 'ADDITIONAL';
  ot_benefit_type: 'DILIGENCE' | 'COMPENSATION' | 'SALARY';
}

interface ApiResponse<T = any> {
  status: string;
  user_id?: string;
  dates?: string[];
  data?: T;
}



class ApiClient {
  private client: any;
  private token: string | null = null;

  constructor(baseURL?: string) {

    // Use Vite env for dev/prod, fallback to localhost for dev
    const resolvedBase = baseURL || import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';
    this.client = axios.create({
      baseURL: resolvedBase,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    (this as any)._resolvedBase = resolvedBase;

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: any) => {
        if (this.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        // Debug logging for outgoing requests to help diagnose timeouts/CORS
        try {
          console.debug('[apiClient] Request', {
            method: config.method,
            url: `${config.baseURL || ''}${config.url}`,
            headers: config.headers,
            data: config.data,
            params: config.params,
          });
        } catch (e) {
          // ignore logging errors
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error?.response?.status === 401) {
          this.clearToken();
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('ez_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('ez_token');
    localStorage.removeItem('ez_user_profile');
  }

  loadTokenFromStorage() {
    const token = localStorage.getItem('ez_token');
    if (token) {
      this.token = token;
    }
    return !!token;
  }

  saveProfileToStorage(profile: ProfileResponse) {
    localStorage.setItem('ez_user_profile', JSON.stringify(profile));
  }

  loadProfileFromStorage(): ProfileResponse | null {
    const raw = localStorage.getItem('ez_user_profile');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProfileResponse;
    } catch {
      localStorage.removeItem('ez_user_profile');
      return null;
    }
  }

  clearProfileFromStorage() {
    localStorage.removeItem('ez_user_profile');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post('/login', credentials);
    // Accept multiple possible token field names from various backends
    const data = response.data || {};
    const token = data.token || data.access_token || data.accessToken || data.token_value;
    if (!token) {
      console.error('Login response did not include a token:', data);
      throw new Error('Login succeeded but no token received from server');
    }
    this.setToken(token);
    return response.data;
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await this.client.get('/profile');
    return response.data;
  }

  // Action endpoints
  async registerWFH(request: RegisterWFHRequest): Promise<ApiResponse> {
    const response = await this.client.post('/wfh/register', request);
    return response.data;
  }

  async registerOT(request: RegisterOTRequest): Promise<ApiResponse> {
    const response = await this.client.post('/ot/register', request);
    return response.data;
  }

  // Salary endpoint
  async downloadSalary(date?: string): Promise<Blob> {
    const params = date ? { date } : {};
    const response = await this.client.post('/salary/download', null, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/healthcheck');
    return response.data;
  }

  // Calendar / Timecard endpoints
  async getCalendarData(fromDate: string, toDate: string, language = 'vi'): Promise<any[]> {
    const response = await this.client.get('/calendar', {
      params: { from_date: fromDate, to_date: toDate, language },
    });
    return response.data;
  }

  // Tickets endpoints
  async getTickets(ticket_status = 'Pending', page_size = 200): Promise<any[]> {
    const response = await this.client.get('/tickets', {
      params: { ticket_status, page_size },
    });
    return response.data;
  }

  async rejectTicket(ticket_id: number): Promise<{ message?: string; ticket_id?: number }> {
    const response = await this.client.post(`/tickets/${ticket_id}/reject`);
    return response.data;
  }

}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
