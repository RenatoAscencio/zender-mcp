# 🐳 Docker Hub Integration Guide

## Configuración de GitHub Actions para Docker Hub

### 1. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

Agrega estos secrets:
- `DOCKER_USERNAME`: Tu nombre de usuario de Docker Hub (renatoascencio)
- `DOCKER_PASSWORD`: Tu token de acceso de Docker Hub (no tu contraseña)

#### Crear Token de Docker Hub:
1. Ir a https://hub.docker.com/settings/security
2. Click en "New Access Token"
3. Nombre: `zender-mcp-github`
4. Permisos: Read, Write, Delete
5. Copiar el token generado

### 2. Publicar Manualmente

```bash
# Login a Docker Hub
docker login -u renatoascencio

# Construir para múltiples arquitecturas
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t renatoascencio/zender-mcp:latest \
  -t renatoascencio/zender-mcp:1.0.0 \
  --push .
```

### 3. Publicación Automática

El workflow de GitHub Actions se ejecutará automáticamente cuando:
- Hagas push a la rama `main` → Publica como `latest`
- Crees un tag `v1.0.0` → Publica como `1.0.0`, `1.0`, `1`

```bash
# Crear y subir un tag de versión
git tag v1.0.0
git push origin v1.0.0
```

## 📦 Usar la Imagen desde Docker Hub

### Para usuarios finales:

```bash
# Descargar y ejecutar la última versión
docker pull renatoascencio/zender-mcp:latest

# Ejecutar con API key
docker run -it --rm \
  -e ZENDER_API_KEY=tu_api_key \
  renatoascencio/zender-mcp:latest

# Versión específica
docker run -it --rm \
  -e ZENDER_API_KEY=tu_api_key \
  renatoascencio/zender-mcp:1.0.0
```

### Integración con Claude usando Docker Hub:

```json
{
  "mcpServers": {
    "zender": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "ZENDER_API_KEY=tu_api_key",
        "renatoascencio/zender-mcp:latest"
      ]
    }
  }
}
```

### Docker Compose con imagen de Docker Hub:

```yaml
version: '3.8'

services:
  zender-mcp:
    image: renatoascencio/zender-mcp:latest
    container_name: zender-mcp-server
    environment:
      - ZENDER_API_KEY=${ZENDER_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
    stdin_open: true
    tty: true
```

## 🏷️ Etiquetas Disponibles

- `latest` - Última versión estable de la rama main
- `1.0.0` - Versión específica
- `1.0` - Última patch de la versión 1.0
- `1` - Última versión minor/patch de la versión 1
- `main` - Última build de la rama main
- `main-SHA` - Build específica por commit SHA

## 🔄 Actualización de la Imagen

```bash
# Para usuarios
docker pull renatoascencio/zender-mcp:latest

# Verificar versión actual
docker run --rm renatoascencio/zender-mcp:latest --version

# Limpiar imágenes antiguas
docker image prune -a
```

## 📊 Verificar Estado en Docker Hub

- URL: https://hub.docker.com/r/renatoascencio/zender-mcp
- Ver tags disponibles
- Estadísticas de descargas
- Documentación automática desde README

## 🔒 Mejores Prácticas

1. **Nunca hardcodees API keys** en la imagen
2. **Usa tags específicos** en producción (no `latest`)
3. **Actualiza regularmente** por seguridad
4. **Verifica la integridad** de la imagen descargada
5. **Usa multi-stage builds** para imágenes más pequeñas

## 🚀 Comandos Útiles

```bash
# Ver todas las tags disponibles
docker images renatoascencio/zender-mcp

# Inspeccionar la imagen
docker inspect renatoascencio/zender-mcp:latest

# Ver el historial de layers
docker history renatoascencio/zender-mcp:latest

# Ejecutar con límites de recursos
docker run -it --rm \
  --memory="512m" \
  --cpus="0.5" \
  -e ZENDER_API_KEY=tu_api_key \
  renatoascencio/zender-mcp:latest
```