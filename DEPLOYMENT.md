# UANG KITA Production Deployment

Target stack: VPS / CloudPanel, Node.js 22, PM2, reverse proxy HTTPS, SQLite on persistent disk.

## 1. Production requirements

- Node.js 22.x
- npm
- PM2
- Git
- HTTPS domain / reverse proxy
- Persistent directories for database, storage, and backups
- Exactly **1 app instance** while UANG KITA uses local SQLite

Recommended directories:

```bash
sudo mkdir -p /var/lib/uang-kita /var/lib/uang-kita/storage /var/backups/uang-kita
sudo chown -R $USER:$USER /var/lib/uang-kita /var/backups/uang-kita
chmod 700 /var/lib/uang-kita /var/backups/uang-kita
```

## 2. Clone and install

```bash
git clone <repository-url> uang-kita
cd uang-kita
git checkout main
npm ci
```

Do not use `npm audit fix --force` during deployment without reviewing breaking changes.

## 3. Production .env

Create `.env` and do not commit it.

```env
NODE_ENV=production
DB_CONNECTION=production
PORT=5555
APP_URL=https://your-domain.com
HAS_CERTIFICATE=false
LOG_LEVEL=info

DB_PATH=/var/lib/uang-kita/production.sqlite3
LOCAL_STORAGE_PATH=/var/lib/uang-kita/storage
LOCAL_STORAGE_PUBLIC_URL=/storage

BACKUP_DIR=/var/backups/uang-kita
BACKUP_RETENTION_DAYS=14

RESEND_API_KEY=
GOOGLE_REDIRECT_URI=https://your-domain.com/google/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`HAS_CERTIFICATE=false` is correct when CloudPanel/Nginx terminates HTTPS and proxies to Node on localhost.

## 4. First release

```bash
npm run prod:check
npm run migrate
npm run release:check
pm2 start ecosystem.config.cjs
pm2 save
```

Verify locally on the server:

```bash
curl http://127.0.0.1:5555/healthz
```

Expected:

```json
{"status":"ok",...}
```

Configure the web server / CloudPanel reverse proxy to forward the domain to `127.0.0.1:5555` and enable HTTPS.

## 5. Normal deploy procedure

Always back up before migrations:

```bash
cd /path/to/uang-kita
npm run backup
git pull
npm ci
npm run migrate
npm run release:check
npm run prod:check
pm2 reload ecosystem.config.cjs --update-env
curl http://127.0.0.1:5555/healthz
```

Then smoke-test:

- `/login`
- `/home`
- `/onboarding`
- `/aman-kalau-dibeli`
- `/aturan-keputusan`
- `/profile`

## 6. Rollback

If the app fails after deployment:

1. Stop writes if possible.
2. Restore the previous application commit.
3. If a migration changed data incompatibly, restore the latest SQLite backup.
4. Run the previous build and restart PM2.

Example app rollback:

```bash
git log --oneline -10
git checkout <known-good-commit>
npm ci
npm run build
pm2 reload ecosystem.config.cjs --update-env
```

Database restore must only be done when the app process is stopped:

```bash
pm2 stop uang-kita
cp /var/backups/uang-kita/<backup-file>.sqlite3 /var/lib/uang-kita/production.sqlite3
pm2 start ecosystem.config.cjs
```

## 7. Backups

Manual backup:

```bash
npm run backup
```

Recommended cron, once daily:

```cron
15 2 * * * cd /path/to/uang-kita && /usr/bin/npm run backup >> /var/log/uang-kita-backup.log 2>&1
```

Keep a second copy off-server before accepting meaningful production usage. Local backups alone do not protect against VPS loss.

## 8. Operational notes

- Keep PM2 at `instances: 1` while using SQLite.
- Never place `production.sqlite3`, `.env`, or backups in Git.
- Keep the database and storage directories persistent across deployments.
- `/healthz` checks both process availability and SQLite connectivity.
- Security headers and secure production session cookies are enabled by the app.
- Global CSRF middleware is intentionally not enabled until Inertia token injection is covered by integration tests.
