# Zender MCP Server

Un servidor MCP (Model Context Protocol) para ConvoChat/Zender que permite enviar SMS y mensajes de WhatsApp desde Claude.

## 🚀 Características

- **SMS**: Envío de mensajes SMS via dispositivos Android o créditos
- **WhatsApp**: Envío de mensajes de texto, multimedia y documentos
- **Gestión de Cuentas**: Vinculación y administración de cuentas WhatsApp
- **Información**: Consulta de dispositivos, créditos y suscripción
- **Docker**: Configuración lista para producción

## 📋 Requisitos

- Node.js 18+
- API Key de ConvoChat/Zender con permisos:
  - `sms_send`
  - `wa_send`
  - `get_rates`
  - `get_wa_accounts`
  - `create_whatsapp`
  - `validate_wa_phone`
  - `get_devices`
  - `get_credits`
  - `get_subscription`

## 🛠️ Instalación

### Opción 1: Docker Hub (Recomendado) 🐳

```bash
# Descargar y ejecutar directamente desde Docker Hub
docker run -it --rm \
  -e ZENDER_API_KEY=tu_api_key \
  renatoascencio/zender-mcp:latest
```

### Opción 2: Desarrollo Local

1. **Clonar e instalar dependencias:**
```bash
git clone https://github.com/RenatoAscencio/zender-mcp.git
cd zender-mcp
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tu API key
```

3. **Construir y ejecutar:**
```bash
npm run build
npm start
```

### Opción 3: Docker Local

1. **Construir la imagen:**
```bash
docker build -t zender-mcp .
```

2. **Ejecutar con docker-compose:**
```bash
# Configurar variables en docker-compose.yml
docker-compose up -d
```

## 🔧 Configuración con Claude

### Método 1: Claude Desktop App

1. **Ubicar el archivo de configuración:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Agregar configuración MCP:**
```json
{
  "mcpServers": {
    "zender": {
      "command": "node",
      "args": ["/ruta/completa/a/zender-mcp/dist/index.js"],
      "env": {
        "ZENDER_API_KEY": "tu_api_key_de_convo_chat"
      }
    }
  }
}
```

3. **Reiniciar Claude Desktop** para cargar la configuración.

### Método 2: Claude Code (CLI)

1. **Crear configuración local:**
```bash
# En el directorio del proyecto
echo '{"mcpServers":{"zender":{"command":"node","args":["./dist/index.js"]}}}' > .claude-config.json
```

2. **Ejecutar con Claude Code:**
```bash
claude-code --mcp-config .claude-config.json
```

### Método 3: Docker Hub con Claude (Más fácil)

```json
{
  "mcpServers": {
    "zender": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "ZENDER_API_KEY=tu_api_key_aqui",
        "renatoascencio/zender-mcp:latest"
      ]
    }
  }
}
```

### ⚠️ Importante:
- Reemplaza `/ruta/completa/a/zender-mcp` con la ruta real de tu proyecto
- Obtén tu API key en: https://sms.convo.chat/dashboard/tools/keys
- Asegúrate de que el servidor esté compilado: `npm run build`

## 📚 Herramientas Disponibles

### Configuración
- `zender_configure` - Configurar conexión a la API

### SMS
- `zender_send_sms` - Enviar mensaje SMS

### WhatsApp
- `zender_send_whatsapp` - Enviar mensaje WhatsApp
- `zender_get_whatsapp_servers` - Obtener servidores disponibles
- `zender_link_whatsapp` - Vincular cuenta WhatsApp
- `zender_relink_whatsapp` - Re-vincular cuenta existente
- `zender_validate_whatsapp_number` - Validar número WhatsApp
- `zender_get_whatsapp_accounts` - Obtener cuentas vinculadas

### Información
- `zender_get_devices` - Obtener dispositivos Android
- `zender_get_credits` - Consultar créditos
- `zender_get_subscription` - Información de suscripción
- `zender_get_gateway_rates` - Tarifas de gateways SMS

## 💡 Ejemplos de Uso

### 1. Configurar el servidor
```json
{
  "tool": "zender_configure",
  "arguments": {
    "apiKey": "tu_api_key_aqui",
    "baseUrl": "https://sms.convo.chat"
  }
}
```

### 2. Enviar SMS
```json
{
  "tool": "zender_send_sms",
  "arguments": {
    "phone": "+573001234567",
    "message": "Hola desde Claude!",
    "mode": "devices",
    "device": "mi_dispositivo_id",
    "priority": 1
  }
}
```

### 3. Enviar WhatsApp
```json
{
  "tool": "zender_send_whatsapp",
  "arguments": {
    "account": "mi_cuenta_wa",
    "recipient": "+573001234567",
    "message": "Mensaje desde Claude via WhatsApp",
    "type": "text",
    "priority": 1
  }
}
```

### 4. Vincular WhatsApp
```json
{
  "tool": "zender_link_whatsapp",
  "arguments": {
    "sid": 123
  }
}
```

## ✅ Verificar Configuración

### 1. Probar el servidor MCP localmente:
```bash
# Compilar el proyecto
npm run build

# Probar que responde correctamente
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
```

### 2. Verificar en Claude:
Después de configurar, en Claude deberías ver las herramientas disponibles:
- `zender_configure`
- `zender_send_sms`
- `zender_send_whatsapp`
- Y 9 herramientas más...

### 3. Primer uso en Claude:
```
Configura Zender con mi API key: [tu_api_key]
```

## 🛠️ Solución de Problemas

### "Zender client not configured"
- **Causa**: No has ejecutado `zender_configure` primero
- **Solución**: Ejecuta la configuración inicial con tu API key

### "Module not found" o "Command not found"
- **Causa**: Ruta incorrecta en la configuración MCP
- **Solución**: Verifica la ruta completa al archivo `dist/index.js`

### "API Key invalid"
- **Causa**: API key incorrecta o sin permisos
- **Solución**: Verifica tu API key en https://sms.convo.chat/dashboard/tools/keys

### Docker no funciona
- **Causa**: Imagen no construida o variables de entorno faltantes
- **Solución**:
  ```bash
  docker build -t zender-mcp .
  docker run -e ZENDER_API_KEY=tu_key -i --rm zender-mcp
  ```

### Claude no reconoce el servidor
- **Causa**: Configuración MCP incorrecta o Claude no reiniciado
- **Solución**:
  1. Verifica la sintaxis JSON de la configuración
  2. Reinicia Claude Desktop completamente
  3. Verifica los logs de Claude

## 🔒 Seguridad

- Las API keys se manejan de forma segura via variables de entorno
- Validación de entrada con Zod schemas
- Timeout configurado para requests HTTP
- Ejecuta con usuario no-root en Docker

## 🐛 Desarrollo

### Scripts disponibles
```bash
npm run dev      # Desarrollo con recarga automática
npm run build    # Construir para producción
npm run start    # Ejecutar versión construida
npm test         # Ejecutar tests
```

### Estructura del proyecto
```
src/
├── index.ts           # Servidor MCP principal
├── zender-client.ts   # Cliente para API ConvoChat
└── types.ts           # Tipos y schemas de validación
```

## 📄 Licencia

MIT

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, crear un issue en GitHub.

---

**Creado con ❤️ para la comunidad Claude/MCP**