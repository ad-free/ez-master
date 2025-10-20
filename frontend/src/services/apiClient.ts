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
    // If using Vite, base URL may be provided via import.meta.env.VITE_API_BASE
    // Fallback order: explicit arg -> VITE_API_BASE -> REACT_APP_API_BASE -> default
    // Use (globalThis as any) to safely access import.meta in environments where it's unavailable.
    const viteEnv = (globalThis as any).importMeta?.env?.VITE_API_BASE || (globalThis as any).importMeta?.env?.VITE_API_BASE;
    const reactEnv = (globalThis as any).__REACT_APP_API_BASE__ || undefined;
    const resolvedBase = baseURL || viteEnv || reactEnv || 'https://ez-master.onrender.com';
    this.client = axios.create({
      baseURL: resolvedBase,
      timeout: 60000, // raised timeout to 60s to help debug slow responses
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for CORS with credentials
    });

    // expose resolved base for quick debugging
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
  }

  loadTokenFromStorage() {
    const token = localStorage.getItem('ez_token');
    if (token) {
      this.token = token;
    }
    return !!token;
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
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
