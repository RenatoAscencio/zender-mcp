#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ZenderClient } from './zender-client.js';
import {
  ZenderConfigSchema,
  SendSMSSchema,
  SendWhatsAppSchema,
  LinkWhatsAppSchema,
  RelinkWhatsAppSchema,
  ValidateWhatsAppNumberSchema,
} from './types.js';

class ZenderMCPServer {
  private readonly server: Server;
  private zenderClient: ZenderClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'zender-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Auto-configure from environment variable if available
    this.autoConfigureFromEnv();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private autoConfigureFromEnv(): void {
    const apiKey = process.env.ZENDER_API_KEY;
    const baseUrl = process.env.ZENDER_BASE_URL || 'https://sms.convo.chat';

    if (apiKey) {
      this.zenderClient = new ZenderClient({
        apiKey,
        baseUrl,
      });
      console.error('[Zender MCP] Auto-configured from environment variables');
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Configuration
        {
          name: 'zender_configure',
          description: 'Configure the Zender/ConvoChat API connection',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: {
                type: 'string',
                description: 'Your ConvoChat API key',
              },
              baseUrl: {
                type: 'string',
                description: 'Base URL for the API (default: https://sms.convo.chat)',
                default: 'https://sms.convo.chat',
              },
            },
            required: ['apiKey'],
          },
        },

        // SMS Tools
        {
          name: 'zender_send_sms',
          description: 'Send SMS message via Zender',
          inputSchema: {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                description: 'Recipient phone number in E.164 format (e.g., +573001234567)',
              },
              message: {
                type: 'string',
                description: 'SMS message content',
              },
              mode: {
                type: 'string',
                enum: ['devices', 'credits'],
                description: 'Sending mode: devices or credits',
                default: 'devices',
              },
              device: {
                type: 'string',
                description: 'Device ID (required for devices mode)',
              },
              gateway: {
                type: 'string',
                description: 'Gateway ID (required for credits mode)',
              },
              sim: {
                type: 'number',
                description: 'SIM slot (1 or 2)',
                enum: [1, 2],
              },
              priority: {
                type: 'number',
                description: 'Message priority (1=high, 2=normal)',
                enum: [1, 2],
                default: 2,
              },
            },
            required: ['phone', 'message'],
          },
        },

        // WhatsApp Tools
        {
          name: 'zender_send_whatsapp',
          description: 'Send WhatsApp message via Zender',
          inputSchema: {
            type: 'object',
            properties: {
              account: {
                type: 'string',
                description: 'WhatsApp account ID',
              },
              recipient: {
                type: 'string',
                description: 'Recipient phone number in E.164 format',
              },
              message: {
                type: 'string',
                description: 'Message content',
              },
              type: {
                type: 'string',
                enum: ['text', 'media', 'document'],
                description: 'Message type',
                default: 'text',
              },
              priority: {
                type: 'number',
                enum: [1, 2],
                description: 'Message priority (1=high, 2=normal)',
                default: 2,
              },
              media_url: {
                type: 'string',
                description: 'Media URL (for media type)',
              },
              media_type: {
                type: 'string',
                enum: ['image', 'audio', 'video'],
                description: 'Media type',
              },
              document_url: {
                type: 'string',
                description: 'Document URL (for document type)',
              },
              document_name: {
                type: 'string',
                description: 'Document name',
              },
              document_type: {
                type: 'string',
                enum: ['pdf', 'xls', 'xlsx', 'docx'],
                description: 'Document type',
              },
            },
            required: ['account', 'recipient', 'message'],
          },
        },

        {
          name: 'zender_get_whatsapp_servers',
          description: 'Get available WhatsApp servers for linking',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        {
          name: 'zender_link_whatsapp',
          description: 'Link a new WhatsApp account',
          inputSchema: {
            type: 'object',
            properties: {
              sid: {
                type: 'number',
                description: 'WhatsApp server ID',
              },
            },
            required: ['sid'],
          },
        },

        {
          name: 'zender_relink_whatsapp',
          description: 'Relink an existing WhatsApp account',
          inputSchema: {
            type: 'object',
            properties: {
              sid: {
                type: 'number',
                description: 'WhatsApp server ID',
              },
              unique: {
                type: 'string',
                description: 'Unique account ID to relink',
              },
            },
            required: ['sid', 'unique'],
          },
        },

        {
          name: 'zender_validate_whatsapp_number',
          description: 'Validate if a phone number has WhatsApp',
          inputSchema: {
            type: 'object',
            properties: {
              unique: {
                type: 'string',
                description: 'WhatsApp account unique ID',
              },
              phone: {
                type: 'string',
                description: 'Phone number to validate (E.164 format)',
              },
            },
            required: ['unique', 'phone'],
          },
        },

        {
          name: 'zender_get_whatsapp_accounts',
          description: 'Get all linked WhatsApp accounts',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        // Account Management Tools
        {
          name: 'zender_get_devices',
          description: 'Get connected Android devices',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        {
          name: 'zender_get_credits',
          description: 'Get account credits balance',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        {
          name: 'zender_get_subscription',
          description: 'Get subscription information and limits',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },

        {
          name: 'zender_get_gateway_rates',
          description: 'Get available SMS gateways and rates',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'zender_configure': {
            const config = ZenderConfigSchema.parse(args);
            this.zenderClient = new ZenderClient(config);
            return {
              content: [
                {
                  type: 'text',
                  text: 'Zender client configured successfully',
                },
              ],
            };
          }

          case 'zender_send_sms': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const params = SendSMSSchema.parse(args);
            const result = await this.zenderClient.sendSMS(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_send_whatsapp': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const params = SendWhatsAppSchema.parse(args);
            const result = await this.zenderClient.sendWhatsApp(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_whatsapp_servers': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getWhatsAppServers();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_link_whatsapp': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const params = LinkWhatsAppSchema.parse(args);
            const result = await this.zenderClient.linkWhatsApp(params.sid);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_relink_whatsapp': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const params = RelinkWhatsAppSchema.parse(args);
            const result = await this.zenderClient.relinkWhatsApp(params.sid, params.unique);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_validate_whatsapp_number': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const params = ValidateWhatsAppNumberSchema.parse(args);
            const result = await this.zenderClient.validateWhatsAppNumber(params.unique, params.phone);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_whatsapp_accounts': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getWhatsAppAccounts();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_devices': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getDevices();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_credits': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getCredits();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_subscription': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getSubscription();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'zender_get_gateway_rates': {
            if (!this.zenderClient) {
              throw new Error('Zender client not configured. Use zender_configure first.');
            }
            const result = await this.zenderClient.getGatewayRates();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Zender MCP server running on stdio');
  }
}

const server = new ZenderMCPServer();
server.run().catch(console.error);