import axios, { AxiosInstance } from 'axios';
import { ZenderConfig, ApiResponse } from './types.js';

export class ZenderClient {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(config: ZenderConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  private async makeRequest(endpoint: string, data: any): Promise<ApiResponse> {
    try {
      const payload = {
        secret: this.apiKey,
        ...data,
      };

      const response = await this.client.post(endpoint, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Unknown error',
        data: error.response?.data,
      };
    }
  }

  // SMS Methods
  async sendSMS(params: {
    phone: string;
    message: string;
    mode?: 'devices' | 'credits';
    device?: string;
    gateway?: string;
    sim?: number;
    priority?: number;
  }): Promise<ApiResponse> {
    return this.makeRequest('/send/sms', params);
  }

  // WhatsApp Methods
  async sendWhatsApp(params: {
    account: string;
    recipient: string;
    message: string;
    type?: 'text' | 'media' | 'document';
    priority?: number;
    media_url?: string;
    media_type?: 'image' | 'audio' | 'video';
    document_url?: string;
    document_name?: string;
    document_type?: 'pdf' | 'xls' | 'xlsx' | 'docx';
  }): Promise<ApiResponse> {
    return this.makeRequest('/send/whatsapp', params);
  }

  async getWhatsAppServers(): Promise<ApiResponse> {
    return this.makeRequest('/get/wa_servers', {});
  }

  async linkWhatsApp(sid: number): Promise<ApiResponse> {
    return this.makeRequest('/create/wa/link', { sid });
  }

  async relinkWhatsApp(sid: number, unique: string): Promise<ApiResponse> {
    return this.makeRequest('/create/wa/relink', { sid, unique });
  }

  async validateWhatsAppNumber(unique: string, phone: string): Promise<ApiResponse> {
    return this.makeRequest('/get/wa/validate_number', { unique, phone });
  }

  async getWhatsAppAccounts(): Promise<ApiResponse> {
    return this.makeRequest('/get/wa_accounts', {});
  }

  // Device and Account Management
  async getDevices(): Promise<ApiResponse> {
    return this.makeRequest('/get/devices', {});
  }

  async getCredits(): Promise<ApiResponse> {
    return this.makeRequest('/get/credits', {});
  }

  async getSubscription(): Promise<ApiResponse> {
    return this.makeRequest('/get/subscription/package', {});
  }

  async getGatewayRates(): Promise<ApiResponse> {
    return this.makeRequest('/get/gateway/rates', {});
  }
}