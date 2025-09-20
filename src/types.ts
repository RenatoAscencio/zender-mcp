import { z } from 'zod';

// Base configuration
export const ZenderConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  baseUrl: z.string().url().default('https://sms.convo.chat'),
});

export type ZenderConfig = z.infer<typeof ZenderConfigSchema>;

// SMS schemas
export const SendSMSSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
  mode: z.enum(['devices', 'credits']).default('devices'),
  device: z.string().optional(),
  gateway: z.string().optional(),
  sim: z.number().int().min(1).max(2).optional(),
  priority: z.number().int().min(1).max(2).default(2),
});

// WhatsApp schemas
export const SendWhatsAppSchema = z.object({
  account: z.string().min(1, 'Account ID is required'),
  recipient: z.string().min(1, 'Recipient phone number is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['text', 'media', 'document']).default('text'),
  priority: z.number().int().min(1).max(2).default(2),
  media_url: z.string().url().optional(),
  media_type: z.enum(['image', 'audio', 'video']).optional(),
  document_url: z.string().url().optional(),
  document_name: z.string().optional(),
  document_type: z.enum(['pdf', 'xls', 'xlsx', 'docx']).optional(),
});

export const LinkWhatsAppSchema = z.object({
  sid: z.number().int().min(1, 'Server ID is required'),
});

export const RelinkWhatsAppSchema = z.object({
  sid: z.number().int().min(1, 'Server ID is required'),
  unique: z.string().min(1, 'Unique account ID is required'),
});

export const ValidateWhatsAppNumberSchema = z.object({
  unique: z.string().min(1, 'Account unique ID is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

// Response types
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Device {
  id: string;
  name: string;
  status: string;
  sim1?: string;
  sim2?: string;
}

export interface WhatsAppAccount {
  unique: string;
  phone: string;
  name: string;
  status: string;
  sid: number;
}

export interface Credits {
  balance: number;
  currency: string;
}

export interface Subscription {
  package: string;
  expires_at: string;
  limits: {
    sms: number;
    whatsapp: number;
  };
}