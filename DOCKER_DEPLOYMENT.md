# V2Ray Server - Docker Deployment Guide

This application can be deployed using Docker and Docker Compose for both development and production environments.

## Quick Start (Development)

### Prerequisites
- Docker installed
- Docker Compose installed

### Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the application image
- Start the V2Ray server
- Start PostgreSQL database
- Expose the web interface on `http://localhost:5000`

### Access the Application
- **Web Interface**: http://localhost:5000
- **API**: http://localhost:5000/api
- **V2Ray WebSocket**: ws://localhost:5000/vmess (proxied)

## Production Deployment

### Environment Configuration

Create a `.env` file for production:

```bash
# Database
DB_USER=v2rayuser
DB_PASSWORD=your_secure_password_here
DB_NAME=v2ray_production

# Application
NODE_ENV=production
PORT=5000

# Optional: V2Ray defaults (can be changed via UI)
INITIAL_UUID=your-uuid-here
INITIAL_PATH=/vmess
INITIAL_SNI=www.airtel.africa
```

### Deploy with Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will:
- Build the optimized production image
- Start services with automatic restart on failure
- Include health checks
- Map port 80 to the application

### Docker Build & Run Manually

Build the image:
```bash
docker build -t v2ray-server:latest .
```

Run the container:
```bash
docker run -d \
  --name v2ray-server \
  -p 5000:5000 \
  -p 10000:10000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:password@host:5432/dbname \
  -v v2ray_data:/app/data \
  v2ray-server:latest
```

## Port Mapping

| Port | Purpose | Protocol |
|------|---------|----------|
| 5000 | Web Interface & HTTP Proxy | HTTP/WS |
| 10000 | V2Ray WebSocket (Internal) | WS |

## Database Setup

### Automatic Setup
The application will automatically create tables on first run using Drizzle ORM migrations.

### Manual Migration (if needed)
```bash
docker-compose exec v2ray-server npm run db:push
```

## Logs

View application logs:
```bash
docker-compose logs -f v2ray-server
```

View V2Ray logs specifically:
```bash
docker-compose logs -f v2ray-server | grep "\[V2Ray\]"
```

## Volume Management

### Development
- `./data` - Application data (SQLite or local files)

### Production
- `v2ray_data` - Application data volume
- `v2ray_logs` - Application logs volume
- `postgres_prod_data` - PostgreSQL data volume

View volumes:
```bash
docker volume ls
```

Clean up volumes:
```bash
docker volume rm v2ray_data v2ray_logs postgres_prod_data
```

## Health Checks

The container includes a health check that:
- Runs every 30 seconds
- Checks the `/api/status` endpoint
- Waits 10 seconds before first check
- Retries 3 times before marking unhealthy

View container health:
```bash
docker ps
docker inspect v2ray-server --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Port Already in Use
If port 5000 or 10000 is in use, modify the docker-compose.yml:
```yaml
ports:
  - "8080:5000"    # Access on port 8080 instead
  - "10001:10000"  # Use different V2Ray port
```

### Database Connection Error
Ensure the DATABASE_URL is correct. For compose:
```
postgresql://user:password@postgres:5432/v2ray
```
The hostname should match the service name in docker-compose.yml.

### Container Won't Start
Check logs:
```bash
docker logs v2ray-server
```

Rebuild and restart:
```bash
docker-compose down
docker-compose up --build
```

## Performance Tuning

### Increase Resource Limits
In `docker-compose.yml`, add resource limits:
```yaml
services:
  v2ray-server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### Enable Container Restart Policy
Already configured in `docker-compose.prod.yml` with:
```yaml
restart: on-failure:5  # Restart max 5 times on failure
```

## Updating the Application

### Pull Latest Changes
```bash
git pull origin main
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Networking

For multi-container setups, the containers communicate using the service name:
- From app container → `postgres:5432`
- From postgres container → Can access app on its internal port

Custom network: `v2ray-net` (development) or `v2ray-prod` (production)

## Security Considerations

1. **Database Password**: Use strong, random passwords in production
2. **Environment Variables**: Don't commit `.env` files to git
3. **Image Scanning**: Scan images for vulnerabilities:
   ```bash
   docker scan v2ray-server:latest
   ```
4. **Keep Updated**: Regularly update base images and dependencies
5. **Network**: Consider using a VPN or proxy in front of the container

## Integration with CI/CD

Example GitHub Actions workflow snippet:
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: registry.example.com/v2ray-server:latest

- name: Deploy to production
  run: |
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- V2Ray Documentation: https://www.v2fly.org/
