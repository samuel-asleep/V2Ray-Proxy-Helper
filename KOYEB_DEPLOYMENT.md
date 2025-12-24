# V2Ray Server - Koyeb Deployment Guide

This guide walks you through deploying the V2Ray server to Koyeb using Docker.

## Prerequisites

1. **Koyeb Account**: Sign up at https://app.koyeb.com
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Docker Hub Account** (optional): For pre-built images

## Deployment Methods

### Method 1: Automatic (Git-Connected) - Recommended

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add V2Ray server"
   git push origin main
   ```

2. **Connect Koyeb to GitHub**
   - Go to Koyeb Dashboard
   - Click "Create Service"
   - Select "GitHub" as the source
   - Authorize Koyeb to access your repositories
   - Select your V2Ray repository

3. **Configure Service**
   - **Service name**: `v2ray-server`
   - **Builder**: Docker
   - **Dockerfile path**: `Dockerfile` (default)
   - **Port**: `8000` (Koyeb will set PORT env var)
   - **Instance type**: Free or paid tier

4. **Add Environment Variables**
   Click "Environment variables" and add:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://[user]:[password]@[host]:5432/v2ray
   INITIAL_UUID=[your-uuid]
   INITIAL_PATH=/vmess
   INITIAL_SNI=www.airtel.africa
   ```

5. **Database Setup**
   - **Option A**: Use Koyeb's PostgreSQL addon (recommended)
     - Click "Databases" → "Add database"
     - Create PostgreSQL 16 instance
     - Copy the connection string to `DATABASE_URL`
   
   - **Option B**: Use external PostgreSQL
     - Neon: https://neon.tech (free tier available)
     - AWS RDS, DigitalOcean, etc.

6. **Deploy**
   - Click "Create Service"
   - Koyeb will build and deploy automatically
   - Monitor deployment in the logs tab

### Method 2: Docker Hub Push

1. **Build and Push Image**
   ```bash
   docker build -t your-dockerhub-username/v2ray-server:latest .
   docker push your-dockerhub-username/v2ray-server:latest
   ```

2. **Deploy to Koyeb**
   - Click "Create Service"
   - Select "Docker" as source
   - Enter image: `your-dockerhub-username/v2ray-server:latest`
   - Configure environment variables (see above)
   - Deploy

### Method 3: Manual Docker Registry

```bash
# Build image
docker build -t v2ray-server:latest .

# Tag for registry
docker tag v2ray-server:latest [registry-url]/v2ray-server:latest

# Push
docker push [registry-url]/v2ray-server:latest

# Deploy to Koyeb using the pushed image
```

## Post-Deployment

### Access Your Service

After deployment, Koyeb provides a public URL:
- **Web Interface**: https://your-service-name-[random].koyeb.app
- **API Base**: https://your-service-name-[random].koyeb.app/api

### Initial Setup

1. Open the web interface
2. Go to **Settings**
3. Configure:
   - **UUID**: Auto-generated or your custom one
   - **Path**: `/vmess` (default)
   - **SNI**: `www.airtel.africa` or your preference
4. Click **Save & Restart**

### Get Connection Details

1. Go to **Dashboard**
2. Copy the **VMess Link** or scan the **QR Code**
3. Use in your V2Ray client

## Database Management

### Using Koyeb's PostgreSQL

1. **View Credentials**
   - Service Details → Databases
   - Copy connection string
   - Already injected as `DATABASE_URL`

2. **Connect Directly** (if needed)
   ```bash
   psql postgresql://[user]:[password]@[host]:5432/v2ray
   ```

### Using External PostgreSQL

Set `DATABASE_URL` to your provider's connection string:

**Neon Example**:
```
postgresql://user:password@ep-cool-morning-123.us-east-1.postgres.vercel-storage.com/v2ray
```

**AWS RDS Example**:
```
postgresql://user:password@v2ray-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/v2ray
```

## Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8000` | Auto-set by Koyeb |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `INITIAL_UUID` | UUID for V2Ray client | No (auto-generated) |
| `INITIAL_PATH` | WebSocket path (e.g., `/vmess`) | No |
| `INITIAL_SNI` | SNI spoofing domain | No |

## Scaling

### Increase Performance
1. Go to Service Settings
2. Under "Instance Size", select a larger tier:
   - **Free**: 512MB RAM, shared CPU (limited)
   - **Small**: 1GB RAM
   - **Medium**: 2GB RAM
   - **Large**: 4GB RAM

### Multiple Instances
1. Under "Replicas", increase the number
2. Koyeb will load-balance traffic
3. All instances share the same database

## Monitoring & Logs

### View Logs
1. Service Dashboard → **Logs** tab
2. Filter by:
   - Deployment logs
   - Runtime logs
   - V2Ray process logs

### Example Log Entries
```
[V2Ray] Starting V2Ray with config: {...}
[V2Ray] [STDOUT] V2Ray 5.15.3 started
[V2Ray] [STDOUT] transport/internet/websocket: listening TCP(for WS) on 127.0.0.1:10000
2025/12/24 06:06:50 [Warning] V2Ray 5.15.3 started
```

### Health Check
- Endpoint: `/api/status`
- Method: GET
- Response: `{ "running": true }`
- Check frequency: Every 30 seconds

## Troubleshooting

### Service Won't Start
1. Check logs for errors:
   - Database connection issues
   - Port binding errors
   - V2Ray initialization failures

2. Common issues:
   ```
   Error: listen EADDRINUSE
   → PORT is already in use; check for conflicting processes
   
   Error: connect ECONNREFUSED
   → DATABASE_URL is incorrect or database is down
   
   Error: spawn v2ray ENOENT
   → V2Ray not installed; check Dockerfile
   ```

3. Redeploy:
   - Fix the issue
   - Push to Git or rebuild Docker image
   - Trigger new deployment

### Database Connection Errors
1. Verify `DATABASE_URL` format
2. Check database credentials
3. Ensure database is accessible from Koyeb
4. Whitelist Koyeb's IP if using IP restrictions

### Application Crashes
1. Increase instance size (might be memory limit)
2. Check logs for stack traces
3. Monitor CPU/Memory usage in Koyeb dashboard

## Custom Domain

1. **Add Domain**
   - Service Settings → Custom Domains
   - Enter your domain (e.g., `v2ray.example.com`)
   - Copy CNAME record

2. **Update DNS**
   - Go to your domain registrar
   - Add CNAME: `v2ray.example.com` → `[koyeb-domain].koyeb.app`
   - Wait for DNS propagation (5-30 mins)

3. **SSL/TLS**
   - Koyeb automatically provides free SSL via Let's Encrypt
   - Access via `https://v2ray.example.com`

## Auto-Deploy Updates

### GitHub Auto-Deploy
1. Service Settings → **GitHub integration**
2. Every push to `main` branch triggers:
   - Docker build
   - New deployment
   - Zero-downtime rolling update

### Manual Redeploy
```bash
git add .
git commit -m "Update configuration"
git push origin main
# Koyeb automatically rebuilds and deploys
```

## Security

### Environment Variables
- Never commit `.env` or secrets to Git
- Use Koyeb's environment variable management
- Rotate database credentials periodically

### Database Security
- Use strong passwords for PostgreSQL
- Enable SSL/TLS for connections
- Restrict database access if possible

### Application Security
- Change the default UUID
- Set a strong SNI that doesn't reveal the service
- Use HTTPS (Koyeb provides free SSL)
- Consider IP whitelisting if available

## Costs

### Koyeb Pricing
- **Free Tier**: 1 service, 512MB RAM, shared CPU, 2 database slots
- **Starter**: ~$5/month per service
- **Premium**: $12-50+/month per service

### Database Costs
- **PostgreSQL** (Koyeb): Included in free tier
- **External**: Check provider pricing (Neon free tier available)

## Limits

- **Max Request Time**: 30 seconds (WebSocket connections allowed)
- **Max File Upload**: 100MB
- **Max Build Time**: 30 minutes
- **RAM**: Depends on instance type

## Performance Tips

1. **Use Koyeb's CDN**: Enable caching for static assets
2. **Optimize Database**: Add indexes for frequent queries
3. **Connection Pooling**: Use for database connections
4. **Monitoring**: Set up alerts for crashes/high CPU

## Support & Resources

- **Koyeb Docs**: https://docs.koyeb.com
- **Koyeb Community**: https://community.koyeb.com
- **V2Ray Docs**: https://www.v2fly.org/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Rollback

If a deployment has issues:

1. Go to Service Dashboard
2. Click **Deployments**
3. Find a previous working deployment
4. Click **Revert**
5. Koyeb immediately redeploys the previous version

## Next Steps

1. ✅ Deploy to Koyeb
2. ✅ Configure V2Ray settings via web UI
3. ✅ Get VMess connection link
4. ✅ Import to V2Ray client (macOS, Windows, Linux, Android, iOS)
5. ✅ Start proxying traffic
