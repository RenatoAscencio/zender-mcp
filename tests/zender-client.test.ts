import { ZenderClient } from '../src/zender-client';
import { ZenderConfig } from '../src/types';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ZenderClient', () => {
  let client: ZenderClient;
  let mockConfig: ZenderConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test_api_key',
      baseUrl: 'https://test.example.com',
    };

    // Mock axios.create
    const mockAxiosInstance = {
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    client = new ZenderClient(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a client with the correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    });
  });

  describe('sendSMS', () => {
    it('should send SMS with required parameters', async () => {
      const mockResponse = {
        data: { success: true, message: 'SMS sent successfully' },
      };

      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue({ post: mockPost });

      client = new ZenderClient(mockConfig);

      const params = {
        phone: '+573001234567',
        message: 'Test SMS message',
      };

      const result = await client.sendSMS(params);

      expect(mockPost).toHaveBeenCalledWith('/send/sms', {
        secret: 'test_api_key',
        ...params,
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid API key' },
        },
      };

      const mockPost = jest.fn().mockRejectedValue(mockError);
      (mockedAxios.create as jest.Mock).mockReturnValue({ post: mockPost });

      client = new ZenderClient(mockConfig);

      const params = {
        phone: '+573001234567',
        message: 'Test SMS message',
      };

      const result = await client.sendSMS(params);

      expect(result).toEqual({
        success: false,
        message: 'Invalid API key',
        data: mockError.response.data,
      });
    });
  });

  describe('sendWhatsApp', () => {
    it('should send WhatsApp message with required parameters', async () => {
      const mockResponse = {
        data: { success: true, message: 'WhatsApp message sent' },
      };

      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue({ post: mockPost });

      client = new ZenderClient(mockConfig);

      const params = {
        account: 'test_account',
        recipient: '+573001234567',
        message: 'Test WhatsApp message',
      };

      const result = await client.sendWhatsApp(params);

      expect(mockPost).toHaveBeenCalledWith('/send/whatsapp', {
        secret: 'test_api_key',
        ...params,
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });
  });

  describe('getDevices', () => {
    it('should get devices list', async () => {
      const mockResponse = {
        data: {
          devices: [
            { id: 'device1', name: 'Android Device 1', status: 'connected' },
          ],
        },
      };

      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue({ post: mockPost });

      client = new ZenderClient(mockConfig);

      const result = await client.getDevices();

      expect(mockPost).toHaveBeenCalledWith('/get/devices', {
        secret: 'test_api_key',
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });
  });

  describe('linkWhatsApp', () => {
    it('should link WhatsApp account', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'qr_token_123',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAA...',
        },
      };

      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as jest.Mock).mockReturnValue({ post: mockPost });

      client = new ZenderClient(mockConfig);

      const result = await client.linkWhatsApp(123);

      expect(mockPost).toHaveBeenCalledWith('/create/wa/link', {
        secret: 'test_api_key',
        sid: 123,
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });
  });
});