# Metfold Industries E-Commerce — Cloud Infrastructure Plan

---

## What We Have Now

| Service | Currently Using | Problem |
|---------|----------------|---------|
| Email (OTP, Orders) | Gmail SMTP (`bnarendrareddy7@gmail.com`) | 500 emails/day limit, looks unprofessional, can get flagged as spam |
| Product Images | Cloudinary (free tier) | 25,000 transformations/month limit, 25 GB storage limit |
| Database | MongoDB Atlas (free/shared tier) | 512 MB storage limit, shared resources, slow under load |
| Hosting | Docker Compose (local) | No server, not live, no domain, no SSL |
| Domain/DNS | Not configured | No custom domain |
| Monitoring | Console logs | No alerts, no dashboards, no error tracking |

---

## Platform Options for Each Service

---

## 1. EMAIL SERVICE (OTP, Order Confirmation, Password Reset, Welcome Email)

We send these emails:
- Registration OTP (6-digit code)
- Password Reset OTP
- Order Confirmation (items table, totals)
- Order Status Updates (shipped, delivered)
- Welcome Email
- Trade Account Approved
- Contact Form

### Option A: Amazon SES (Recommended)

| | Details |
|--|---------|
| **What** | AWS email sending service |
| **Cost** | $0.10 per 1,000 emails (cheapest option) |
| **Setup** | Verify domain in SES → Add DNS records → Get SMTP credentials |
| **Code change** | NONE — same Nodemailer, just change `.env` SMTP host/user/pass |
| **Sender address** | `noreply@metfoldsm.com.au` (professional, your own domain) |
| **Daily limit** | Unlimited (after sandbox approval) |
| **Deliverability** | Excellent — DKIM, SPF, DMARC built-in |
| **Dashboard** | Basic — send/bounce/complaint stats in AWS Console |
| **Best for** | Already using AWS for hosting, cheapest option |

```env
# New .env values
SMTP_HOST=email-smtp.ap-southeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIA...          # SES SMTP credential
SMTP_PASS=BK4x...          # SES SMTP credential
EMAIL_FROM=noreply@metfoldsm.com.au
```

### Option B: SendGrid

| | Details |
|--|---------|
| **What** | Dedicated email delivery platform (owned by Twilio) |
| **Cost** | Free: 100 emails/day. Essentials: $20/month for 50,000 emails |
| **Setup** | Sign up → Verify domain → Get API key → Use SMTP or API |
| **Code change** | NONE — same Nodemailer, just change `.env` SMTP host/user/pass |
| **Sender address** | `noreply@metfoldsm.com.au` |
| **Dashboard** | Excellent — open rates, click rates, bounce tracking, email activity feed |
| **Email templates** | Visual drag-and-drop email template builder (no HTML needed) |
| **Best for** | If you want detailed email analytics and visual template editor |

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxx       # SendGrid API key
EMAIL_FROM=noreply@metfoldsm.com.au
```

### Option C: Mailgun

| | Details |
|--|---------|
| **What** | Developer-focused email service (owned by Sinch) |
| **Cost** | Free: 100 emails/day for 3 months. Foundation: $35/month for 50,000 emails |
| **Setup** | Sign up → Verify domain → Get SMTP credentials |
| **Code change** | NONE — same Nodemailer SMTP |
| **Dashboard** | Good — logs, events, analytics |
| **Best for** | Developer-friendly APIs, webhook tracking |

### Option D: Resend (Modern)

| | Details |
|--|---------|
| **What** | Modern email API built for developers |
| **Cost** | Free: 3,000 emails/month. Pro: $20/month for 50,000 emails |
| **Setup** | Sign up → Verify domain → Get API key |
| **Code change** | NONE — supports SMTP, just change `.env` |
| **Dashboard** | Clean modern UI — delivery logs, analytics |
| **Best for** | Modern developer experience, React email templates |

### Recommendation

| Criteria | Winner |
|----------|--------|
| Cheapest | **Amazon SES** ($0.10/1000 emails) |
| Best dashboard & analytics | **SendGrid** (open rates, click tracking, template builder) |
| If already on AWS | **Amazon SES** (no extra account, same billing) |
| Easiest setup | **Resend** (5-minute setup) |

**My recommendation: Amazon SES** — cheapest, your domain, already in AWS ecosystem. If you later want email analytics (who opened, who clicked), switch to SendGrid.

---

## 2. IMAGE STORAGE & CDN (Product Images, Category Images, Banners)

We store:
- Product images (uploaded by admin, ~1200×1200, auto WebP)
- Category images
- Banner images
- CMS/blog images

### Option A: Keep Cloudinary (Current — Recommended to Keep)

| | Details |
|--|---------|
| **What** | Image hosting + CDN + auto-transformation (resize, WebP, crop) |
| **Cost** | Free: 25 GB storage, 25,000 transformations. Plus: $89/month for 225 GB, 225,000 transforms |
| **Code change** | NONE — already using it |
| **CDN** | Built-in global CDN (fast image loading worldwide) |
| **Auto-transform** | Auto WebP, auto quality, auto resize — all in URL params |
| **Dashboard** | Image library, usage stats, transformation analytics |
| **Best for** | Already integrated, powerful image transformations, no migration needed |

```
Current image URL:
https://res.cloudinary.com/dieahvgvq/image/upload/w_600,f_auto,q_auto/metfold/products/abc.jpg
```

**Why keep Cloudinary:**
- Already integrated in `upload.service.ts` — zero work to keep
- Auto WebP conversion, auto quality, auto resize — S3 can't do this without Lambda
- Built-in CDN — no need for separate CloudFront setup
- Image transformations via URL — crop, resize, watermark on-the-fly
- Just upgrade to paid plan when free tier runs out ($89/month)

### Option B: Amazon S3 + CloudFront

| | Details |
|--|---------|
| **What** | S3 = file storage, CloudFront = CDN |
| **Cost** | S3: $0.025/GB/month. CloudFront: $0.114/GB transfer. Total ~$5-15/month |
| **Code change** | YES — replace Cloudinary SDK with AWS S3 SDK + Sharp for image processing |
| **CDN** | CloudFront (AWS CDN, edge locations worldwide) |
| **Auto-transform** | NO built-in — need Sharp library or Lambda@Edge for resize/WebP |
| **Dashboard** | Basic — file listing in S3, CloudFront stats |
| **Best for** | Cheapest long-term, full AWS ecosystem, control over storage |

```
New image URL:
https://images.metfoldsm.com.au/products/abc.webp
```

### Option C: Imgix

| | Details |
|--|---------|
| **What** | Image CDN + processing service (sits on top of S3 or any storage) |
| **Cost** | $10/month + $2 per 1,000 master images |
| **Code change** | Upload to S3, Imgix processes and serves — need S3 + Imgix SDK |
| **CDN** | Built-in global CDN |
| **Auto-transform** | Yes — resize, crop, WebP, quality via URL params (like Cloudinary) |
| **Best for** | If you want S3 storage + Cloudinary-like transformations |

### Option D: Bunny CDN + Bunny Storage

| | Details |
|--|---------|
| **What** | Cheap CDN + storage |
| **Cost** | Storage: $0.01/GB. CDN: $0.01/GB transfer. Cheapest option |
| **Code change** | YES — replace Cloudinary SDK with Bunny API |
| **Auto-transform** | Basic — resize only via Bunny Optimizer ($9.50/month extra) |
| **Best for** | Absolute cheapest image hosting + CDN |

### Recommendation

| Criteria | Winner |
|----------|--------|
| No code change needed | **Cloudinary** (already integrated) |
| Cheapest long-term | **S3 + CloudFront** or **Bunny** |
| Best image transformations | **Cloudinary** or **Imgix** |
| Full AWS ecosystem | **S3 + CloudFront** |

**My recommendation: Keep Cloudinary** — it's already working, has the best image transformations, built-in CDN. Just upgrade plan when needed. Don't spend development time rewriting the upload service for S3 unless you have a specific reason.

If you later want to move to S3: store raw images in S3, use Imgix or Lambda for transformations.

---

## 3. DATABASE (Products, Orders, Users, Categories)

### Option A: Amazon DocumentDB (Recommended for AWS)

| | Details |
|--|---------|
| **What** | AWS managed MongoDB-compatible database |
| **Cost** | db.t3.medium: ~$60 USD/month |
| **Code change** | NONE — same Mongoose, same queries, just change connection string |
| **Backup** | Automatic daily backups, point-in-time recovery |
| **Scaling** | Add read replicas, scale instance size |
| **Security** | Inside VPC private subnet, encrypted at rest |
| **Best for** | Full AWS setup, managed backups, high availability |

```env
MONGODB_URI=mongodb://metfold_admin:pass@metfold-cluster.xxxx.ap-southeast-2.docdb.amazonaws.com:27017/metfold_ecommerce?tls=true&retryWrites=false
```

### Option B: MongoDB Atlas (Current — Keep)

| | Details |
|--|---------|
| **What** | MongoDB's own managed cloud service |
| **Cost** | Free: 512 MB. M10: $57/month (10 GB). M20: $140/month |
| **Code change** | NONE — already using it |
| **Backup** | Automatic backups, point-in-time recovery on paid plans |
| **Dashboard** | Excellent — performance advisor, real-time metrics, query profiler |
| **Best for** | Already using it, best MongoDB dashboard, no migration needed |
| **AWS integration** | Can VPC Peer with AWS VPC for private connectivity |

```env
# Current — no change needed
MONGODB_URI=mongodb+srv://narendrareddy2209_db_user:***@cluster0.nyyi4dr.mongodb.net/metfold_ecommerce
```

### Option C: MongoDB on EC2 (Self-managed)

| | Details |
|--|---------|
| **What** | Install MongoDB yourself on an EC2 instance |
| **Cost** | EC2 t3.medium: ~$30/month (cheapest option) |
| **Code change** | NONE — same Mongoose |
| **Backup** | YOU manage backups (scripted mongodump + S3) |
| **Scaling** | YOU manage replication, scaling |
| **Best for** | Cheapest, but you manage everything — updates, security, backups |

### Recommendation

| Criteria | Winner |
|----------|--------|
| No migration work | **MongoDB Atlas** (already using it) |
| Best dashboard | **MongoDB Atlas** (query profiler, performance advisor) |
| Full AWS ecosystem | **Amazon DocumentDB** |
| Cheapest | **MongoDB on EC2** ($30/month but self-managed) |

**My recommendation: Stay on MongoDB Atlas** (upgrade to M10 paid plan). VPC Peer it with AWS VPC for private connectivity. No data migration needed, best dashboard, best MongoDB compatibility.

If you want 100% AWS: use DocumentDB — same code, just change connection string + migrate data with `mongodump`/`mongorestore`.

---

## 4. APPLICATION HOSTING (Backend Express + Frontend Next.js)

### Option A: Amazon ECS Fargate (Recommended)

| | Details |
|--|---------|
| **What** | Serverless container hosting — runs your Docker images |
| **Cost** | ~$30-45/month for 2 services (backend + frontend) |
| **Code change** | NONE — same Docker images |
| **Auto-scaling** | Yes — add more containers automatically when traffic increases |
| **Zero downtime deploy** | Yes — rolling deployment |
| **Best for** | Already Dockerised, production-ready, auto-scaling |

### Option B: AWS EC2 (Virtual Server)

| | Details |
|--|---------|
| **What** | Rent a virtual machine, install Node.js, run apps manually |
| **Cost** | t3.medium: ~$30/month. t3.large: ~$60/month |
| **Code change** | NONE — run `npm start` on server |
| **Auto-scaling** | Manual — need to set up yourself |
| **Deploy** | SSH into server → git pull → restart — or use PM2 |
| **Best for** | Simplest, cheapest, familiar (like running on your laptop) |

### Option C: AWS Elastic Beanstalk

| | Details |
|--|---------|
| **What** | AWS managed platform — upload code, it handles servers |
| **Cost** | Same as EC2 (~$30/month) — Beanstalk is free, you pay for EC2 underneath |
| **Code change** | NONE |
| **Deploy** | `eb deploy` — uploads code, restarts automatically |
| **Best for** | Don't want to manage servers, don't want Docker complexity |

### Option D: Vercel (Frontend) + Railway (Backend)

| | Details |
|--|---------|
| **What** | Vercel = best Next.js hosting. Railway = easy backend hosting |
| **Cost** | Vercel Pro: $20/month. Railway: $5-20/month |
| **Code change** | NONE |
| **Deploy** | Git push → auto-deploy (both platforms) |
| **Best for** | Fastest setup, best Next.js performance (Vercel built Next.js) |

### Recommendation

| Criteria | Winner |
|----------|--------|
| Easiest setup | **Vercel + Railway** (git push = deployed) |
| Best Next.js performance | **Vercel** (they built Next.js) |
| Full AWS control | **ECS Fargate** |
| Cheapest | **EC2** ($30/month for everything on one server) |
| Production-ready scaling | **ECS Fargate** |

**My recommendation: ECS Fargate** if you want full AWS. Or **Vercel (frontend) + ECS (backend)** for best of both worlds.

---

## 5. DOMAIN & SSL — Amazon Route 53 + ACM

### No alternatives needed — Route 53 is the standard choice for AWS

| Service | What It Does | Cost |
|---------|-------------|------|
| **Route 53** | Manages DNS for `metfoldsm.com.au` — points domain to your servers | $0.50/month per hosted zone |
| **ACM** | Free SSL certificates for HTTPS | FREE (auto-renewing) |

**DNS Records you'll create:**
```
onlinestore.metfoldsm.com.au  →  ALB (Frontend)
api.metfoldsm.com.au          →  ALB (Backend)
images.metfoldsm.com.au       →  CloudFront (if using S3) or Cloudinary
```

**SSL:** ACM gives you free `*.metfoldsm.com.au` wildcard certificate — covers all subdomains.

---

## 6. LOAD BALANCER — Application Load Balancer (ALB)

| | Details |
|--|---------|
| **What** | Sits in front of your servers, routes traffic, handles HTTPS |
| **Cost** | ~$25-35/month |
| **What it does** | Receives all traffic → sends `api.` to backend, `onlinestore.` to frontend |
| **HTTPS** | Terminates SSL (ACM certificate) — your servers only deal with HTTP |
| **Health checks** | Pings `/health` every 30 seconds — if backend crashes, stops sending traffic to it |

```
User Browser
    ↓ HTTPS
   ALB (port 443, SSL from ACM)
    ├── api.metfoldsm.com.au → Backend ECS (port 5000)
    └── onlinestore.metfoldsm.com.au → Frontend ECS (port 2209)
```

---

## 7. SECURITY — WAF + IAM

| Service | What It Does | Cost |
|---------|-------------|------|
| **WAF** | Blocks SQL injection, XSS, bad bots, rate limiting at the edge | ~$12/month |
| **Shield Standard** | DDoS protection (automatic, free with ALB) | FREE |
| **IAM** | Controls which service can access what (backend → S3, SES, DB) | FREE |
| **Security Groups** | Firewall rules — DB only accessible from backend, not internet | FREE |

---

## 8. MONITORING — CloudWatch + SNS

| Service | What It Does | Cost |
|---------|-------------|------|
| **CloudWatch Logs** | All app logs (Winston + Morgan output) automatically collected from ECS | ~$5/month |
| **CloudWatch Metrics** | CPU, memory, request count, error rate dashboards | ~$5/month |
| **CloudWatch Alarms** | Alert when: errors spike, CPU high, app crashes | ~$2/month |
| **SNS** | Sends alarm notifications to your email or phone | ~$1/month |

**You get an email when:**
- 5xx errors exceed 10 in 5 minutes
- CPU stays above 80% for 5 minutes
- Backend health check fails 3 times
- Database CPU exceeds 70%

---

## 9. SECRETS — AWS Secrets Manager

| | Details |
|--|---------|
| **What** | Stores passwords, API keys, connection strings securely |
| **Cost** | $0.40 per secret/month (~$4/month for all secrets) |
| **Replaces** | `.env` files — no more secrets in code or files |
| **How** | ECS reads secrets at container start → injects as environment variables |

**Secrets stored:**
```
metfold/db-uri                → MongoDB/DocumentDB connection string
metfold/jwt-access-secret     → JWT signing key
metfold/jwt-refresh-secret    → JWT refresh key
metfold/stripe-secret-key     → Stripe API key
metfold/stripe-webhook-secret → Stripe webhook secret
metfold/ses-smtp-user         → SES SMTP username
metfold/ses-smtp-pass         → SES SMTP password
metfold/google-client-id      → Google OAuth client ID
```

---

## 10. CI/CD — AWS CodePipeline + CodeBuild

| | Details |
|--|---------|
| **What** | Automatic build and deploy when you push to GitHub |
| **Cost** | ~$3/month (100 build minutes free tier) |
| **Replaces** | Manual `git push` + manual server restart |

**Flow:**
```
You: git push origin main
  ↓ (automatic)
CodePipeline detects push
  ↓
CodeBuild: npm install → npm build → docker build → push to ECR
  ↓
ECS: pulls new image → starts new container → health check → switch traffic
  ↓
Done! Live in ~5 minutes, zero downtime
```

---

## 11. CACHING (Optional, Add Later) — ElastiCache Redis

| | Details |
|--|---------|
| **What** | In-memory cache — stores frequently accessed data for instant retrieval |
| **Cost** | cache.t3.micro: ~$15-20/month |
| **What it caches** | Category tree, product listings, rate limiting counters |
| **Benefit** | Pages load faster, database gets fewer queries |
| **When to add** | When traffic grows and database becomes a bottleneck |

---

## 12. BACKGROUND JOBS (Optional, Add Later) — SQS + Lambda

| | Details |
|--|---------|
| **What** | Queue system — API puts jobs in queue, Lambda processes them in background |
| **Cost** | Near free (SQS: $0.40/million requests. Lambda: 1M free requests/month) |
| **What it processes** | Email sending, Excel imports, image processing |
| **Benefit** | API responds instantly — doesn't wait for email to send or import to finish |
| **When to add** | When email sending or imports start slowing down API responses |

---

## Final Recommended Stack

| Service | Platform | Reason | Monthly Cost |
|---------|----------|--------|-------------|
| **Email** | Amazon SES | Cheapest, own domain, already in AWS | ~$2 |
| **Images** | Cloudinary (keep current) | Already working, best transformations, no migration | Free → $89 when upgraded |
| **Database** | MongoDB Atlas (keep current) | Already working, best dashboard, VPC Peer with AWS | Free → $57 (M10 plan) |
| **Backend hosting** | ECS Fargate | Auto-scaling, zero downtime deploy, Docker ready | ~$25 |
| **Frontend hosting** | ECS Fargate | Same cluster as backend, simpler management | ~$20 |
| **Load balancer** | ALB | Routes traffic, HTTPS, health checks | ~$30 |
| **Domain/DNS** | Route 53 | Manages metfoldsm.com.au | ~$1 |
| **SSL** | ACM | Free auto-renewing HTTPS certificates | FREE |
| **Secrets** | Secrets Manager | No more .env files, secure | ~$4 |
| **Security** | WAF + Shield | Blocks attacks, DDoS protection | ~$12 |
| **Monitoring** | CloudWatch + SNS | Logs, dashboards, email alerts | ~$13 |
| **CI/CD** | CodePipeline + CodeBuild | Auto-deploy on git push | ~$3 |
| **Total** | | | **~$160-220/month** |

*Add Redis caching (~$20) and SQS/Lambda (~$2) later when traffic grows.*

---

## Architecture Diagram

```
                    Customer Browser
                          │
                   ┌──────▼──────┐
                   │  Route 53   │  metfoldsm.com.au
                   └──┬───────┬──┘
                      │       │
            ┌─────────▼──┐  ┌─▼──────────┐
            │    ALB     │  │ Cloudinary  │
            │  (HTTPS)   │  │  (Images)   │
            │  + WAF     │  │  KEEP AS-IS │
            └──┬──────┬──┘  └─────────────┘
               │      │
      ┌────────▼┐   ┌─▼───────┐     AWS VPC (Private)
      │  ECS    │   │  ECS    │     ────────────────
      │Frontend │   │Backend  │
      │Next.js  │   │Express  │
      └─────────┘   └──┬───┬─┘
                        │   │
             ┌──────────┘   └──────────┐
             │                         │
      ┌──────▼──────┐          ┌───────▼───────┐
      │MongoDB Atlas│          │  Amazon SES   │
      │(VPC Peered) │          │   (Email)     │
      │ KEEP AS-IS  │          │  OTP, Orders  │
      └─────────────┘          └───────────────┘

   Supporting: Secrets Manager │ CloudWatch │ CodePipeline │ ACM │ IAM
```

---

## What Changes in Code vs What Stays Same

| Component | Change? | Details |
|-----------|---------|---------|
| Mongoose queries | NO CHANGE | Same database, same queries |
| Cloudinary upload | NO CHANGE | Keep Cloudinary as-is |
| Nodemailer email | NO CHANGE | Same library, only `.env` SMTP values change |
| Stripe payments | NO CHANGE | Stripe works everywhere |
| Google OAuth | NO CHANGE | Just update redirect URI in Google Console |
| JWT auth | NO CHANGE | Same logic, secrets from Secrets Manager |
| Docker images | NO CHANGE | Same Dockerfiles, push to ECR instead |
| `.env` file | REPLACED | Secrets Manager + Parameter Store inject env vars |
| Frontend API URL | CHANGE | `NEXT_PUBLIC_API_URL=https://api.metfoldsm.com.au/api/v1` |
| CORS origin | CHANGE | `CORS_ORIGIN=https://onlinestore.metfoldsm.com.au` |

---

## Migration Checklist

### Week 1 — AWS Foundation
- [ ] Create AWS account, enable MFA, set up billing alerts
- [ ] Create VPC with public + private subnets
- [ ] Set up Route 53 for `metfoldsm.com.au`
- [ ] Request ACM SSL certificates
- [ ] Store all secrets in Secrets Manager

### Week 2 — Deploy Application
- [ ] Push Docker images to ECR
- [ ] Create ECS cluster + task definitions + services
- [ ] Create ALB with listener rules
- [ ] Point DNS to ALB
- [ ] Test: browse site via `onlinestore.metfoldsm.com.au`

### Week 3 — Email + Security
- [ ] Set up Amazon SES — verify domain, DKIM, request production access
- [ ] Update SMTP config to SES
- [ ] Test: registration OTP, password reset OTP, order confirmation emails
- [ ] Set up WAF on ALB
- [ ] Set up CloudWatch alarms + SNS email alerts

### Week 4 — CI/CD + Go Live
- [ ] Set up CodePipeline + CodeBuild
- [ ] Test: git push → auto-deploy
- [ ] Upgrade MongoDB Atlas to M10 (or migrate to DocumentDB)
- [ ] VPC Peer MongoDB Atlas with AWS VPC
- [ ] Final testing of all flows
- [ ] GO LIVE
