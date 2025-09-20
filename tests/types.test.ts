import {
  ZenderConfigSchema,
  SendSMSSchema,
  SendWhatsAppSchema,
  LinkWhatsAppSchema,
  RelinkWhatsAppSchema,
  ValidateWhatsAppNumberSchema,
} from '../src/types';

describe('Type Schemas', () => {
  describe('ZenderConfigSchema', () => {
    it('should validate correct config', () => {
      const validConfig = {
        apiKey: 'test_api_key_123',
        baseUrl: 'https://sms.convo.chat',
      };

      const result = ZenderConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should use default baseUrl when not provided', () => {
      const config = {
        apiKey: 'test_api_key_123',
      };

      const result = ZenderConfigSchema.parse(config);
      expect(result.baseUrl).toBe('https://sms.convo.chat');
    });

    it('should throw error for empty apiKey', () => {
      const invalidConfig = {
        apiKey: '',
        baseUrl: 'https://test.com',
      };

      expect(() => ZenderConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should throw error for invalid URL', () => {
      const invalidConfig = {
        apiKey: 'test_key',
        baseUrl: 'not-a-url',
      };

      expect(() => ZenderConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('SendSMSSchema', () => {
    it('should validate correct SMS data', () => {
      const validSMS = {
        phone: '+573001234567',
        message: 'Test message',
        mode: 'devices' as const,
        device: 'device123',
        sim: 1,
        priority: 1,
      };

      const result = SendSMSSchema.parse(validSMS);
      expect(result).toEqual(validSMS);
    });

    it('should use default values', () => {
      const sms = {
        phone: '+573001234567',
        message: 'Test message',
      };

      const result = SendSMSSchema.parse(sms);
      expect(result.mode).toBe('devices');
      expect(result.priority).toBe(2);
    });

    it('should throw error for invalid sim slot', () => {
      const invalidSMS = {
        phone: '+573001234567',
        message: 'Test message',
        sim: 3, // Invalid: only 1 or 2 allowed
      };

      expect(() => SendSMSSchema.parse(invalidSMS)).toThrow();
    });

    it('should throw error for empty phone', () => {
      const invalidSMS = {
        phone: '',
        message: 'Test message',
      };

      expect(() => SendSMSSchema.parse(invalidSMS)).toThrow();
    });
  });

  describe('SendWhatsAppSchema', () => {
    it('should validate correct WhatsApp data', () => {
      const validWhatsApp = {
        account: 'account123',
        recipient: '+573001234567',
        message: 'Test WhatsApp message',
        type: 'text' as const,
        priority: 1,
      };

      const result = SendWhatsAppSchema.parse(validWhatsApp);
      expect(result).toEqual(validWhatsApp);
    });

    it('should use default values', () => {
      const whatsapp = {
        account: 'account123',
        recipient: '+573001234567',
        message: 'Test message',
      };

      const result = SendWhatsAppSchema.parse(whatsapp);
      expect(result.type).toBe('text');
      expect(result.priority).toBe(2);
    });

    it('should validate media message', () => {
      const mediaMessage = {
        account: 'account123',
        recipient: '+573001234567',
        message: 'Check this image',
        type: 'media' as const,
        media_url: 'https://example.com/image.jpg',
        media_type: 'image' as const,
      };

      const result = SendWhatsAppSchema.parse(mediaMessage);
      expect(result).toEqual({
        ...mediaMessage,
        priority: 2, // Default value
      });
    });

    it('should validate document message', () => {
      const documentMessage = {
        account: 'account123',
        recipient: '+573001234567',
        message: 'Here is the document',
        type: 'document' as const,
        document_url: 'https://example.com/doc.pdf',
        document_name: 'report.pdf',
        document_type: 'pdf' as const,
      };

      const result = SendWhatsAppSchema.parse(documentMessage);
      expect(result).toEqual({
        ...documentMessage,
        priority: 2, // Default value
      });
    });

    it('should throw error for empty account', () => {
      const invalidWhatsApp = {
        account: '',
        recipient: '+573001234567',
        message: 'Test message',
      };

      expect(() => SendWhatsAppSchema.parse(invalidWhatsApp)).toThrow();
    });
  });

  describe('LinkWhatsAppSchema', () => {
    it('should validate correct link data', () => {
      const validLink = {
        sid: 123,
      };

      const result = LinkWhatsAppSchema.parse(validLink);
      expect(result).toEqual(validLink);
    });

    it('should throw error for invalid sid', () => {
      const invalidLink = {
        sid: 0, // Should be >= 1
      };

      expect(() => LinkWhatsAppSchema.parse(invalidLink)).toThrow();
    });
  });

  describe('RelinkWhatsAppSchema', () => {
    it('should validate correct relink data', () => {
      const validRelink = {
        sid: 123,
        unique: 'unique_account_id',
      };

      const result = RelinkWhatsAppSchema.parse(validRelink);
      expect(result).toEqual(validRelink);
    });

    it('should throw error for empty unique', () => {
      const invalidRelink = {
        sid: 123,
        unique: '',
      };

      expect(() => RelinkWhatsAppSchema.parse(invalidRelink)).toThrow();
    });
  });

  describe('ValidateWhatsAppNumberSchema', () => {
    it('should validate correct validation data', () => {
      const validValidation = {
        unique: 'unique_account_id',
        phone: '+573001234567',
      };

      const result = ValidateWhatsAppNumberSchema.parse(validValidation);
      expect(result).toEqual(validValidation);
    });

    it('should throw error for empty fields', () => {
      const invalidValidation = {
        unique: '',
        phone: '',
      };

      expect(() => ValidateWhatsAppNumberSchema.parse(invalidValidation)).toThrow();
    });
  });
});