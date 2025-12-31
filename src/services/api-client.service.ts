import { Injectable, inject } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Backend-ready API client service
 * This service provides a unified interface for all backend API calls.
 * Currently uses localStorage, but can easily be switched to real HTTP calls.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private errorHandler = inject(ErrorHandlerService);

  private config: ApiConfig = {
    baseUrl: '/api', // Will be environment-specific
    timeout: 30000,
    retries: 3
  };

  // Authentication token (would come from auth service)
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  /**
   * Make an API request with automatic retry, timeout, and error handling
   */
  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    const { endpoint, method, body, headers = {}, params } = request;

    // Add authentication header if token exists
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Build URL with query parameters
    let url = `${this.config.baseUrl}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    // Create fetch options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    };

    // Execute with retry logic
    return this.errorHandler.withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Handle empty responses (e.g., 204 No Content)
          const contentType = response.headers.get('content-type');
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            data = text ? text : null;
          }
          
          return {
            data,
            status: response.status,
            headers: response.headers
          };
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }
      },
      this.config.retries
    );
  }

  // Convenience methods
  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'GET', params });
  }

  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ endpoint, method: 'DELETE' });
  }
}

/**
 * Platform Integration Service
 * Handles OAuth flows and platform-specific API calls
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformIntegrationService {
  private api = inject(ApiClientService);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * Initiate OAuth flow for a platform
   * This would open OAuth popup and handle callback
   */
  async initiateOAuth(platform: string): Promise<{ authUrl: string; state: string }> {
    try {
      // In real implementation, this would call backend OAuth endpoint
      const response = await this.api.post('/auth/oauth/initiate', { platform });
      return response.data;
    } catch (error) {
      this.errorHandler.showError(`Failed to initiate ${platform} authentication`);
      throw error;
    }
  }

  /**
   * Complete OAuth flow with authorization code
   */
  async completeOAuth(platform: string, code: string, state: string): Promise<{ accessToken: string }> {
    try {
      const response = await this.api.post('/auth/oauth/callback', {
        platform,
        code,
        state
      });
      return response.data;
    } catch (error) {
      this.errorHandler.showError(`Failed to complete ${platform} authentication`);
      throw error;
    }
  }

  /**
   * Test platform connection
   */
  async testConnection(platform: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/integrations/${platform}/test`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Post ad to platform
   */
  async postAd(platform: string, adData: any): Promise<{ id: string; url: string }> {
    try {
      const response = await this.api.post(`/integrations/${platform}/ads`, adData);
      this.errorHandler.showSuccess(`Ad posted to ${platform} successfully`);
      return response.data;
    } catch (error) {
      this.errorHandler.showError(`Failed to post ad to ${platform}`);
      throw error;
    }
  }

  /**
   * Get campaign metrics from platform
   */
  async getCampaignMetrics(platform: string, campaignId: string): Promise<any> {
    try {
      const response = await this.api.get(`/integrations/${platform}/campaigns/${campaignId}/metrics`);
      return response.data;
    } catch (error) {
      this.errorHandler.showError(`Failed to fetch metrics from ${platform}`);
      throw error;
    }
  }
}
