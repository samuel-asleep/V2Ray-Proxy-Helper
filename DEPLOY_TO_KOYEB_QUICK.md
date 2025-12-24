# Deploy V2Ray to Koyeb - Quick Start

## 5-Minute Setup

### Step 1: Prepare Your Code
```bash
git add .
git commit -m "Ready for Koyeb deployment"
git push origin main
```

### Step 2: Create Koyeb Service
1. Go to https://app.koyeb.com
2. Click **"Create Service"**
3. Select **GitHub** (or GitLab/Bitbucket)
4. Authorize and select your repository
5. Click **"Next"**

### Step 3: Configure Service
- **Service name**: `v2ray-server`
- **Builder**: Docker (auto-detected)
- **Port**: `8000`

### Step 4: Add Database
Click **"Add Database"** → **PostgreSQL 16**
- Koyeb creates it automatically
- Connection string is auto-injected

### Step 5: Environment Variables
Click **"Environment Variables"** and add:
```
NODE_ENV=production
INITIAL_UUID=550e8400-e29b-41d4-a716-446655440000
INITIAL_PATH=/vmess
INITIAL_SNI=www.airtel.africa
```

(DATABASE_URL is auto-set by Koyeb's PostgreSQL addon)

### Step 6: Deploy
Click **"Create Service"** → Watch logs → Done!

## Access Your Service

After deployment (2-3 minutes), you get a URL:
```
https://v2ray-server-[random].koyeb.app
```

1. Open the dashboard
2. Go to **Settings**
3. Update SNI: `www.airtel.africa` (or your preference)
4. Click **Save & Restart**
5. Copy the **VMess Link** or QR code

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Docker syntax, ensure `npm install` works locally |
| Can't connect to DB | Wait 30 seconds, Koyeb might still be provisioning DB |
| 503 Service Unavailable | Check logs, likely startup error or missing env vars |
| V2Ray won't start | Check DATABASE_URL format, verify PostgreSQL is healthy |

## Custom Domain (Optional)
1. Service Settings → **Custom Domains**
2. Add your domain (e.g., `v2ray.example.com`)
3. Copy CNAME record
4. Update DNS at your registrar
5. Koyeb auto-generates SSL/TLS

## Auto-Redeploy on Git Push
Every `git push origin main` triggers:
- Docker rebuild
- Zero-downtime deployment
- All environment vars preserved

## Scale Later
Need more power?
1. Service Settings → **Instance Size**
2. Select larger tier (more CPU/RAM)
3. Or increase replicas for load balancing

---

**Full docs**: See `KOYEB_DEPLOYMENT.md` for advanced config, scaling, security, etc.
