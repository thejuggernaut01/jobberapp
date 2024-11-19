import axios, { AxiosResponse } from 'axios';
import { ENVIRONMENT } from '@gateway/config/environment';
import { IAuth } from '@thejuggernaut01/jobberapp-shared';

import { AxiosService } from './axios';

// each service will have it's own axios instance
// we need to add jwt token coming from the cookie session
// to the req from api gateway to the microservice

// we use axiosAuthInstance when we want to make req to protected routes
export let axiosAuthInstance: ReturnType<typeof axios.create>;

class AuthService {
  axiosService: AxiosService;

  constructor() {
    // we use this.axiosService to make req to endpoints in auth service
    // that is not protected
    this.axiosService = new AxiosService(`${ENVIRONMENT.BASE_URL.AUTH}/api/v1/auth`, 'auth');
    axiosAuthInstance = this.axiosService.axios;
  }

  async getCurrentUser(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.get('/currentUser');
    return response;
  }

  async getRefreshToken(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.get(`/refresh-token/${username}`);
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.put('/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  }

  async verifyEmail(token: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.put('/verify-email', token);
    return response;
  }

  async resendEmail(data: { userId: number; email: string }): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/resend-email', data);
    return response;
  }

  async signUp(body: IAuth): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/signup', body);
    return response;
  }

  async signIn(body: IAuth): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/signin', body);
    return response;
  }

  async forgotPassword(email: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.put('/forgot-password', { email });
    return response;
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.put(`/reset-password/${token}`, { password, confirmPassword });
    return response;
  }

  async getGigs(query: string, from: string, size: string, type: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.get(`/search/gig/${from}/${size}/${type}?${query}`);
    return response;
  }

  async getGig(gigId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.get(`/search/gig/${gigId}`);
    return response;
  }

  async seed(count: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.put(`/seed/${count}`);
    return response;
  }
}

export const authService: AuthService = new AuthService();
