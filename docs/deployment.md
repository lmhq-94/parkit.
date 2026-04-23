# Deployment Guide

Guide for deploying Parkit applications to production environments.

## Overview

Parkit consists of multiple applications that need to be deployed:
- **Backend API** - Node.js/Express API
- **Web Dashboard** - Next.js web application
- **Mobile Valet App** - React Native/Expo app
- **Mobile Customer App** - React Native/Expo app

## Prerequisites

- Domain names for each application
- SSL certificates (or use Let's Encrypt)
- Hosting accounts (VPS, cloud provider, or PaaS)
- Database hosting (PostgreSQL)
- Environment variables configured
- CI/CD pipeline (GitHub Actions or similar)

## Backend API Deployment

### Option 1: VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup

```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone repository
git clone https://github.com/your-org/parkit.git
cd parkit/apps/api
```

#### 2. Environment Configuration

```bash
cp .env.example .env
nano .env
```

Configure:
```bash
DATABASE_URL=postgresql://user:password@host:5432/parkit
JWT_SECRET=your-production-secret
PORT=3000
NODE_ENV=production
```

#### 3. Install Dependencies

```bash
npm install --production
```

#### 4. Run Migrations

```bash
npm run prisma migrate deploy
```

#### 5. Start with PM2

```bash
pm2 start dist/server.js --name parkit-api
pm2 save
pm2 startup
```

#### 6. Configure Nginx

```nginx
server {
    listen 80;
    server_name api.parkit.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.parkit.com
```

### Option 2: PaaS (Render, Railway, etc.)

#### Render

1. Connect GitHub repository
2. Select `apps/api` as root directory
3. Add environment variables
4. Deploy automatically on push to main

#### Railway

1. Connect GitHub repository
2. Select `apps/api` as root directory
3. Add PostgreSQL service
4. Add environment variables
5. Deploy automatically

## Web Dashboard Deployment

### Option 1: Vercel (Recommended)

1. Connect GitHub repository
2. Import project from `apps/web`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.parkit.com
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://dashboard.parkit.com
   ```
4. Deploy automatically on push to main

### Option 2: VPS

#### 1. Build

```bash
cd apps/web
npm run build
```

#### 2. Start with PM2

```bash
pm2 start npm --name parkit-web -- start
pm2 save
```

#### 3. Configure Nginx

```nginx
server {
    listen 80;
    server_name dashboard.parkit.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## Mobile Apps Deployment

### Using EAS (Expo Application Services)

#### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

#### 2. Configure EAS

```bash
cd apps/mobile/mobile-valet
eas build:configure
```

#### 3. Build for iOS

```bash
eas build --platform ios --auto-submit
```

#### 4. Build for Android

```bash
eas build --platform android --auto-submit
```

#### 5. Submit to Stores

- **iOS**: Automatically submitted to App Store Connect
- **Android**: Automatically submitted to Google Play Console

### Manual Build

#### iOS (requires macOS + Xcode)

```bash
cd apps/mobile/mobile-valet
npx expo prebuild --clean
npx expo run:ios
```

Then archive and submit via Xcode.

#### Android

```bash
cd apps/mobile/mobile-valet
npx expo prebuild --clean
npx expo run:android
```

Then build APK/AAB and submit via Google Play Console.

## Database Deployment

### Neon (Recommended for PostgreSQL)

1. Create account at [Neon](https://neon.tech/)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### AWS RDS

1. Create PostgreSQL instance
2. Configure security groups
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### Self-hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE parkit;
CREATE USER parkit_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE parkit TO parkit_user;
\q
```

## Environment Variables

### Production Checklist

#### API
- [ ] `DATABASE_URL` - Production PostgreSQL connection
- [ ] `JWT_SECRET` - Strong random secret
- [ ] `PORT` - Typically 3000
- [ ] `NODE_ENV=production`

#### Web
- [ ] `NEXT_PUBLIC_API_URL` - Production API URL
- [ ] `NEXTAUTH_SECRET` - Strong random secret
- [ ] `NEXTAUTH_URL` - Production dashboard URL

#### Mobile
- [ ] `EXPO_PUBLIC_API_URL` - Production API URL
- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Production Google client ID
- [ ] `EXPO_PUBLIC_MICROSOFT_CLIENT_ID` - Production Microsoft client ID

## CI/CD Deployment

### GitHub Actions

See [ci-cd.md](ci-cd.md) for CI/CD pipeline configuration.

Add deployment steps to `.github/workflows/ci.yml`:

```yaml
- name: Deploy API
  run: |
    ssh user@server 'cd /path/to/parkit/apps/api && git pull && npm install --production && npm run prisma migrate deploy && pm2 restart parkit-api'
```

## Monitoring

### API Monitoring

- Use PM2 monitoring: `pm2 monit`
- Add logging service (Sentry, LogRocket)
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Web Monitoring

- Vercel provides built-in monitoring
- Add analytics (Google Analytics, Plausible)
- Error tracking (Sentry)

### Mobile Monitoring

- Expo provides build and update analytics
- Add crash reporting (Sentry, Bugsnag)
- Use Expo Updates for over-the-air updates

## Security

### SSL/TLS

- Always use HTTPS in production
- Use Let's Encrypt for free SSL
- Configure HSTS headers
- Keep SSL certificates updated

### Firewall

- Configure UFW on VPS:
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

### Secrets Management

- Never commit secrets to git
- Use environment variables
- Rotate secrets regularly
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)

## Backup Strategy

### Database Backups

- Neon provides automatic backups
- For self-hosted: set up pgBackRest or WAL-E
- Test restore procedures regularly

### Code Backups

- Git provides version control
- Regular pushes to GitHub
- Tag releases for rollback capability

## Scaling

### API Scaling

- Use load balancer (Nginx, HAProxy)
- Run multiple instances with PM2 cluster
- Consider containerization (Docker, Kubernetes)

### Web Scaling

- Vercel handles scaling automatically
- For VPS: use load balancer + multiple instances

### Database Scaling

- Neon handles scaling automatically
- For RDS: configure read replicas
- Consider connection pooling (PgBouncer)

## Troubleshooting

### Common Issues

#### API won't start
- Check port availability
- Verify environment variables
- Check database connection
- Review logs: `pm2 logs parkit-api`

#### Web build fails
- Check environment variables
- Verify API URL is accessible
- Review build logs

#### Mobile build fails
- Check EAS configuration
- Verify environment variables
- Check Expo account status
- Review build logs in EAS dashboard

## Rollback Procedure

### API Rollback

```bash
cd /path/to/parkit/apps/api
git checkout previous-tag
npm install --production
npm run prisma migrate deploy
pm2 restart parkit-api
```

### Web Rollback

- Vercel: Deploy previous commit from dashboard
- VPS: Similar to API rollback

### Mobile Rollback

- Use Expo Updates to revert to previous version
- Or submit new build with previous code

## Support

For deployment issues:
- Check application logs
- Review CI/CD pipeline logs
- Consult provider documentation
- Open GitHub issue for project-specific problems
