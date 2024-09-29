import { ENVIRONMENT } from '@gateway/config/environment';
import axios, { AxiosInstance } from 'axios';
import { sign } from 'jsonwebtoken';

export class AxiosService {
  public axios: ReturnType<typeof axios.create>;

  constructor(baseURL: string, serviceName: string) {
    this.axios = this.axiosCreateInstance(baseURL, serviceName);
  }

  /**
   * axiosCreateInstance
   */
  public axiosCreateInstance(baseURL: string, serviceName?: string): AxiosInstance {
    let requestGatewayToken = '';

    if (serviceName) {
      requestGatewayToken = sign({ id: serviceName }, `${ENVIRONMENT.TOKEN.GATEWAY_JWT}`);
    }

    const instance: AxiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken: requestGatewayToken
      },
      withCredentials: true
    });

    return instance;
  }
}
