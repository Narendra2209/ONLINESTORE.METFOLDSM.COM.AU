# Metfold Industries E-Commerce — AWS Cloud Infrastructure Plan (100% AWS)

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

## What We're Moving To (100% AWS)

| Service | AWS Service | Replaces |
|---------|------------|----------|
| Email | **Amazon SES** | Gmail SMTP |
| Images | **S3 + CloudFront + Lambda@Edge** | Cloudinary |
| Database | **Amazon DocumentDB** | MongoDB Atlas |
| Hosting | **ECS Fargate** | Docker Compose (local) |
| Domain/DNS | **Route 53 + ACM** | Not configured |
| Load Balancer | **ALB** | None |
| Security | **WAF + Shield + IAM** | None |
| Monitoring | **CloudWatch + SNS** | Console logs |
| Secrets | **Secrets Manager** | .env files |
| CI/CD | **CodePipeline + CodeBuild + ECR** | Manual deploy |
| Caching | **ElastiCache Redis** | None (add later) |
| Background Jobs | **SQS + Lambda** | None (add later) |

---

## 1. EMAIL SERVICE — Amazon SES

We send these emails:
- Registration OTP (6-digit code)
- Password Reset OTP
- Order Confirmation (items table, totals)
- Order Status Updates (shipped, delivered)
- Welcome Email
- Trade Account Approved
- Contact Form

| | Details |
|--|---------|
| **What** | AWS email sending service |
| **Cost** | $0.10 per 1,000 emails |
| **Setup** | Verify domain in SES → Add DNS records (DKIM, SPF, DMARC) → Request production access |
| **Code change** | NONE — same Nodemailer, just change `.env` SMTP host/user/pass |
| **Sender address** | `noreply@metfoldsm.com.au` (professional, your own domain) |
| **Daily limit** | Unlimited (after sandbox approval) |
| **Deliverability** | Excellent — DKIM, SPF, DMARC built-in |
| **Dashboard** | Send/bounce/complaint stats in AWS Console |

```env
# New .env values
SMTP_HOST=email-smtp.ap-southeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIA...          # SES SMTP credential
SMTP_PASS=BK4x...          # SES SMTP credential
EMAIL_FROM=noreply@metfoldsm.com.au
```

### SES Setup Steps
1. Go to AWS SES Console → Verified Identities → Create Identity
2. Choose "Domain" → Enter `metfoldsm.com.au`
3. SES gives you DNS records (DKIM CNAME records) → Add them in Route 53
4. Wait for verification (usually 24-72 hours)
5. Request production access (to remove sandbox 200/day limit)
6. Create SMTP credentials in SES → Account dashboard → SMTP settings → Create credentials
7. Update backend `.env` with new SMTP values

---

## 2. IMAGE STORAGE & CDN — Amazon S3 + CloudFront + Sharp

### Current Setup (Cloudinary)
```
Upload flow: Multer (memory) → Cloudinary SDK → Cloudinary CDN URL
Image URL: https://res.cloudinary.com/dieahvgvq/image/upload/w_600,f_auto,q_auto/metfold/products/abc.jpg
```

### New Setup (S3 + CloudFront)
```
Upload flow: Multer (memory) → Sharp (resize/WebP) → AWS S3 SDK → CloudFront CDN URL
Image URL: https://images.metfoldsm.com.au/products/abc.webp
```

| | Details |
|--|---------|
| **What** | S3 = file storage, CloudFront = CDN, Sharp = image processing |
| **Cost** | S3: $0.025/GB/month. CloudFront: $0.114/GB transfer. Total ~$5-15/month |
| **CDN** | CloudFront (AWS CDN, edge locations worldwide including Australia) |
| **Image processing** | Sharp library in backend — resize, convert to WebP, optimize quality before upload |
| **Storage** | Unlimited (S3 has no storage limit) |
| **Backup** | S3 versioning + lifecycle policies |

### S3 Bucket Structure
```
metfold-images/
├── products/           # Product images
│   ├── {productId}/
│   │   ├── original/   # Original uploaded images (backup)
│   │   └── optimized/  # Processed WebP images (served via CDN)
├── categories/         # Category images
├── banners/            # Banner images
└── cms/                # Blog/CMS images
```

### Code Changes Required

**Replace `upload.service.ts`** — swap Cloudinary SDK with AWS S3 SDK + Sharp:

```typescript
// NEW upload.service.ts — S3 + Sharp
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

const s3 = new S3Client({ region: env.AWS_REGION });
const BUCKET = env.S3_BUCKET_NAME;
const CDN_URL = env.CLOUDFRONT_URL; // https://images.metfoldsm.com.au

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  const id = uuidv4();
  const key = `${folder}/${id}.webp`;

  // Process image with Sharp — resize + WebP + optimize
  const processedBuffer = await sharp(fileBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Upload to S3
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: processedBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // 1 year cache
  }));

  // Also upload original as backup
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${folder}/original/${id}.original`,
    Body: fileBuffer,
    ContentType: 'application/octet-stream',
  }));

  return {
    url: `${CDN_URL}/${key}`,
    publicId: key, // S3 key used for deletion
  };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: publicId,
  }));
};
```

**New environment variables:**
```env
AWS_REGION=ap-southeast-2
S3_BUCKET_NAME=metfold-images
CLOUDFRONT_URL=https://images.metfoldsm.com.au
```

**New npm packages:**
```bash
npm install @aws-sdk/client-s3 sharp uuid
npm uninstall cloudinary
```

**Update `env.ts`** — replace Cloudinary vars with AWS vars:
```typescript
// Remove
CLOUDINARY_CLOUD_NAME: z.string().default(''),
CLOUDINARY_API_KEY: z.string().default(''),
CLOUDINARY_API_SECRET: z.string().default(''),

// Add
AWS_REGION: z.string().default('ap-southeast-2'),
S3_BUCKET_NAME: z.string(),
CLOUDFRONT_URL: z.string(),
```

### S3 + CloudFront Setup Steps
1. **Create S3 bucket:** `metfold-images` in `ap-southeast-2` (Sydney)
   - Block all public access (CloudFront will access via OAC)
   - Enable versioning
   - Add lifecycle rule: move originals to S3 Glacier after 90 days
2. **Create CloudFront distribution:**
   - Origin: S3 bucket `metfold-images`
   - Origin Access Control (OAC) — CloudFront reads from private S3
   - Custom domain: `images.metfoldsm.com.au`
   - ACM certificate: `*.metfoldsm.com.au`
   - Cache policy: CachingOptimized (1 year TTL)
   - Compress objects: Yes (Gzip + Brotli)
3. **Route 53:** Add CNAME `images.metfoldsm.com.au` → CloudFront distribution domain
4. **S3 bucket policy:** Allow only CloudFront OAC to read objects
5. **IAM:** ECS task role needs `s3:PutObject`, `s3:DeleteObject` permissions on `metfold-images/*`

### Data Migration (Cloudinary → S3)
```bash
# 1. Export all image URLs from MongoDB
# 2. Download from Cloudinary
# 3. Process with Sharp → upload to S3
# 4. Update product/banner/category documents with new S3 URLs
# Script will be created for this migration
```

---

## 3. DATABASE — Amazon DocumentDB

### Current Setup (MongoDB Atlas)
```env
MONGODB_URI=mongodb+srv://narendrareddy2209_db_user:***@cluster0.nyyi4dr.mongodb.net/metfold_ecommerce
```

### New Setup (DocumentDB)
```env
MONGODB_URI=mongodb://metfold_admin:password@metfold-cluster.cluster-xxxx.ap-southeast-2.docdb.amazonaws.com:27017/metfold_ecommerce?tls=true&retryWrites=false
```

| | Details |
|--|---------|
| **What** | AWS managed MongoDB-compatible database |
| **Cost** | db.t3.medium: ~$60 USD/month |
| **Code change** | NONE — same Mongoose, same queries, just change connection string |
| **Backup** | Automatic daily backups, point-in-time recovery (up to 35 days) |
| **Scaling** | Add read replicas, scale instance size |
| **Security** | Inside VPC private subnet, encrypted at rest + in transit |
| **Monitoring** | CloudWatch metrics — CPU, memory, connections, IOPS |

### DocumentDB Limitations vs MongoDB Atlas
| Feature | DocumentDB | MongoDB Atlas |
|---------|-----------|---------------|
| MongoDB compatibility | v5.0 compatible | Full MongoDB (latest) |
| `retryWrites` | NOT supported — must set `retryWrites=false` | Supported |
| Change streams | Supported | Supported |
| Aggregation pipeline | Most stages supported | Full support |
| Text search | Supported | Full-text search with Atlas Search |
| Transactions | Supported | Supported |
| Dashboard | CloudWatch metrics | Atlas UI (better) |

### Key Change: `retryWrites=false`
DocumentDB doesn't support `retryWrites`. Add to connection string:
```
?tls=true&retryWrites=false
```
This is the ONLY code-level change needed. All Mongoose queries, models, and aggregations work the same.

### DocumentDB Setup Steps
1. **Create DocumentDB subnet group** — use private subnets from VPC
2. **Create DocumentDB cluster:**
   - Engine: MongoDB 5.0 compatible
   - Instance: db.t3.medium (2 vCPU, 4 GB RAM)
   - Region: ap-southeast-2 (Sydney)
   - Master username: `metfold_admin`
   - Encryption at rest: enabled
   - Backup retention: 7 days
3. **Security group:** Allow port 27017 from ECS security group only
4. **Download DocumentDB CA certificate** for TLS connection
5. **Update connection string** in Secrets Manager

### Data Migration (Atlas → DocumentDB)
```bash
# 1. Export from Atlas
mongodump --uri="mongodb+srv://narendrareddy2209_db_user:***@cluster0.nyyi4dr.mongodb.net/metfold_ecommerce" --out=./metfold-backup

# 2. Import to DocumentDB (from EC2 bastion inside VPC)
mongorestore --uri="mongodb://metfold_admin:password@metfold-cluster.cluster-xxxx.ap-southeast-2.docdb.amazonaws.com:27017" --tls --tlsCAFile=global-bundle.pem --db=metfold_ecommerce ./metfold-backup/metfold_ecommerce
```

---

## 4. APPLICATION HOSTING — Amazon ECS Fargate

| | Details |
|--|---------|
| **What** | Serverless container hosting — runs your Docker images without managing servers |
| **Cost** | ~$30-45/month for 2 services (backend + frontend) |
| **Code change** | NONE — same Docker images, same Dockerfiles |
| **Auto-scaling** | Yes — add more containers automatically when traffic increases |
| **Zero downtime deploy** | Yes — rolling deployment (new container starts → health check passes → old container stops) |
| **Logging** | Container stdout/stderr → CloudWatch Logs automatically |

### ECS Architecture
```
ECS Cluster: metfold-cluster
├── Service: metfold-backend
│   ├── Task Definition: backend (Express.js)
│   │   ├── Image: {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-backend:latest
│   │   ├── Port: 5000
│   │   ├── CPU: 512 (0.5 vCPU)
│   │   ├── Memory: 1024 MB
│   │   └── Environment: from Secrets Manager
│   ├── Desired count: 1 (scale to 2+ under load)
│   └── Health check: GET /health → 200 OK
│
└── Service: metfold-frontend
    ├── Task Definition: frontend (Next.js)
    │   ├── Image: {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-frontend:latest
    │   ├── Port: 2209
    │   ├── CPU: 512 (0.5 vCPU)
    │   ├── Memory: 1024 MB
    │   └── Environment: NEXT_PUBLIC_API_URL, etc.
    ├── Desired count: 1
    └── Health check: GET / → 200 OK
```

### ECR (Elastic Container Registry) — Docker Image Storage
```bash
# Create repositories
aws ecr create-repository --repository-name metfold-backend --region ap-southeast-2
aws ecr create-repository --repository-name metfold-frontend --region ap-southeast-2

# Login to ECR
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin {account}.dkr.ecr.ap-southeast-2.amazonaws.com

# Build and push
docker build -t metfold-backend ./backend
docker tag metfold-backend:latest {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-backend:latest
docker push {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-backend:latest

docker build -t metfold-frontend ./frontend
docker tag metfold-frontend:latest {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-frontend:latest
docker push {account}.dkr.ecr.ap-southeast-2.amazonaws.com/metfold-frontend:latest
```

### ECS Setup Steps
1. **Create ECR repositories** (metfold-backend, metfold-frontend)
2. **Build & push Docker images** to ECR
3. **Create ECS cluster:** metfold-cluster (Fargate)
4. **Create task definitions** for backend and frontend
   - Reference ECR images
   - Set CPU/memory limits
   - Configure Secrets Manager integration for env vars
   - Set CloudWatch log groups
5. **Create ECS services** with ALB target groups
6. **Configure auto-scaling** — target tracking on CPU (scale at 70%)

---

## 5. DOMAIN & SSL — Amazon Route 53 + ACM

| Service | What It Does | Cost |
|---------|-------------|------|
| **Route 53** | Manages DNS for `metfoldsm.com.au` — points domain to your servers | $0.50/month per hosted zone |
| **ACM** | Free SSL certificates for HTTPS | FREE (auto-renewing) |

### DNS Records
```
metfoldsm.com.au              →  ALB (redirect to onlinestore.)
onlinestore.metfoldsm.com.au  →  ALB (Frontend ECS)
api.metfoldsm.com.au          →  ALB (Backend ECS)
images.metfoldsm.com.au       →  CloudFront distribution (S3 images)
```

### SSL
ACM gives you a free `*.metfoldsm.com.au` wildcard certificate — covers all subdomains. Auto-renews forever.

### Setup Steps
1. **Route 53:** Create hosted zone for `metfoldsm.com.au`
2. **Update domain registrar:** Point nameservers to Route 53 NS records
3. **ACM:** Request certificate for `*.metfoldsm.com.au` + `metfoldsm.com.au`
4. **ACM validation:** Add CNAME records in Route 53 (one-click from ACM console)
5. **Wait for certificate** to be issued (~5-30 minutes with DNS validation)
6. **Add A records** (Alias) pointing to ALB and CloudFront

---

## 6. LOAD BALANCER — Application Load Balancer (ALB)

| | Details |
|--|---------|
| **What** | Sits in front of your servers, routes traffic, handles HTTPS |
| **Cost** | ~$25-35/month |
| **What it does** | Receives all traffic → routes by hostname to correct ECS service |
| **HTTPS** | Terminates SSL (ACM certificate) — your containers only deal with HTTP |
| **Health checks** | Pings `/health` every 30 seconds — if container crashes, stops sending traffic |

### Traffic Flow
```
Customer Browser
    ↓ HTTPS (port 443)
   ALB (SSL terminated by ACM certificate)
    ├── Host: api.metfoldsm.com.au     → Target Group: metfold-backend  (port 5000)
    ├── Host: onlinestore.metfoldsm.com.au → Target Group: metfold-frontend (port 2209)
    └── Host: metfoldsm.com.au         → Redirect to onlinestore.metfoldsm.com.au
```

### Setup Steps
1. **Create ALB** in public subnets (ap-southeast-2a, ap-southeast-2b)
2. **Create target groups:** metfold-backend (port 5000), metfold-frontend (port 2209)
3. **Add HTTPS listener (443):** Attach ACM certificate
4. **Add listener rules:** Route by Host header to correct target group
5. **Add HTTP listener (80):** Redirect all HTTP → HTTPS
6. **Security group:** Allow inbound 80, 443 from anywhere

---

## 7. SECURITY — WAF + Shield + IAM + Security Groups

| Service | What It Does | Cost |
|---------|-------------|------|
| **WAF** | Blocks SQL injection, XSS, bad bots, rate limiting at ALB edge | ~$12/month |
| **Shield Standard** | DDoS protection (automatic, free with ALB) | FREE |
| **IAM** | Controls which service can access what | FREE |
| **Security Groups** | Firewall rules per resource | FREE |

### IAM Roles
```
metfold-ecs-task-role:
  - s3:PutObject, s3:DeleteObject on metfold-images/*
  - ses:SendEmail, ses:SendRawEmail
  - secretsmanager:GetSecretValue on metfold/*

metfold-ecs-execution-role:
  - ecr:GetAuthorizationToken, ecr:GetDownloadUrlForLayer
  - logs:CreateLogStream, logs:PutLogEvents
  - secretsmanager:GetSecretValue
```

### Security Groups
```
ALB-SG:           Inbound 80, 443 from 0.0.0.0/0
ECS-SG:           Inbound 5000, 2209 from ALB-SG only
DocumentDB-SG:    Inbound 27017 from ECS-SG only
Redis-SG:         Inbound 6379 from ECS-SG only (when added)
```

### WAF Rules
- AWS Managed Rules — Common Rule Set (SQLi, XSS, etc.)
- AWS Managed Rules — Known Bad Inputs
- Rate limiting: 2,000 requests per 5 minutes per IP
- Geo-blocking: Optional — restrict to Australia only if needed

---

## 8. MONITORING — CloudWatch + SNS

| Service | What It Does | Cost |
|---------|-------------|------|
| **CloudWatch Logs** | All app logs (Winston + Morgan output) collected from ECS containers | ~$5/month |
| **CloudWatch Metrics** | CPU, memory, request count, error rate dashboards | ~$5/month |
| **CloudWatch Alarms** | Alert when thresholds exceeded | ~$2/month |
| **SNS** | Sends alarm notifications to your email or phone | ~$1/month |

### Log Groups
```
/ecs/metfold-backend      → Backend Express logs
/ecs/metfold-frontend     → Frontend Next.js logs
/aws/docdb/metfold-cluster → DocumentDB logs
```

### Alarms — You get an email/SMS when:
- 5xx errors exceed 10 in 5 minutes
- ECS CPU stays above 80% for 5 minutes
- Backend health check fails 3 consecutive times
- DocumentDB CPU exceeds 70%
- DocumentDB free storage below 2 GB
- ECS task count drops to 0 (service down)

### Dashboard
Create a CloudWatch dashboard "Metfold-Production" with:
- ALB request count, 4xx/5xx rates
- ECS CPU/memory utilization
- DocumentDB connections, IOPS, CPU
- S3 bucket size, request count
- SES send/bounce/complaint rates

---

## 9. SECRETS — AWS Secrets Manager

| | Details |
|--|---------|
| **What** | Stores passwords, API keys, connection strings securely |
| **Cost** | $0.40 per secret/month (~$5/month for all secrets) |
| **Replaces** | `.env` files — no more secrets in code or files |
| **How** | ECS task definition references secrets → injected as environment variables at container start |

### Secrets Stored
```
metfold/db-uri                → DocumentDB connection string
metfold/jwt-access-secret     → JWT signing key
metfold/jwt-refresh-secret    → JWT refresh key
metfold/stripe-secret-key     → Stripe API key
metfold/stripe-webhook-secret → Stripe webhook secret
metfold/ses-smtp-user         → SES SMTP username
metfold/ses-smtp-pass         → SES SMTP password
metfold/google-client-id      → Google OAuth client ID
metfold/google-client-secret  → Google OAuth client secret
metfold/s3-bucket-name        → metfold-images
metfold/cloudfront-url        → https://images.metfoldsm.com.au
```

### ECS Task Definition — Secrets Reference
```json
{
  "secrets": [
    { "name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:ap-southeast-2:123456:secret:metfold/db-uri" },
    { "name": "JWT_ACCESS_SECRET", "valueFrom": "arn:aws:secretsmanager:ap-southeast-2:123456:secret:metfold/jwt-access-secret" },
    { "name": "STRIPE_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:ap-southeast-2:123456:secret:metfold/stripe-secret-key" }
  ]
}
```

---

## 10. CI/CD — AWS CodePipeline + CodeBuild + ECR

| | Details |
|--|---------|
| **What** | Automatic build and deploy when you push to GitHub |
| **Cost** | ~$3/month (100 build minutes free tier) |
| **Replaces** | Manual `git push` + manual server restart |

### Pipeline Flow
```
You: git push origin main
  ↓ (automatic — GitHub webhook)
CodePipeline triggers
  ↓
CodeBuild (buildspec.yml):
  1. npm install (backend + frontend)
  2. npm run build
  3. docker build -t metfold-backend ./backend
  4. docker build -t metfold-frontend ./frontend
  5. docker tag + push to ECR
  ↓
ECS Deploy:
  1. Pull new image from ECR
  2. Start new container
  3. Health check passes
  4. Route traffic to new container
  5. Stop old container
  ↓
Done! Live in ~5-8 minutes, zero downtime
```

### buildspec.yml
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Building backend...
      - docker build -t metfold-backend ./backend
      - docker tag metfold-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-backend:latest
      - echo Building frontend...
      - docker build -t metfold-frontend ./frontend
      - docker tag metfold-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-frontend:latest
  post_build:
    commands:
      - echo Pushing to ECR...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-backend:latest
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-frontend:latest
      - echo Writing image definitions...
      - printf '[{"name":"metfold-backend","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-backend:latest > backend-imagedefinitions.json
      - printf '[{"name":"metfold-frontend","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/metfold-frontend:latest > frontend-imagedefinitions.json
artifacts:
  files:
    - backend-imagedefinitions.json
    - frontend-imagedefinitions.json
```

---

## 11. CACHING (Add Later) — ElastiCache Redis

| | Details |
|--|---------|
| **What** | In-memory cache inside your VPC |
| **Cost** | cache.t3.micro: ~$15-20/month |
| **What it caches** | Category tree, product listings, rate limiting counters, session data |
| **Benefit** | Pages load faster, DocumentDB gets fewer queries |
| **When to add** | When traffic grows and database becomes a bottleneck |

---

## 12. BACKGROUND JOBS (Add Later) — SQS + Lambda

| | Details |
|--|---------|
| **What** | Queue system — API puts jobs in queue, Lambda processes them in background |
| **Cost** | Near free (SQS: $0.40/million requests. Lambda: 1M free requests/month) |
| **What it processes** | Email sending, Excel imports, image processing, order notifications |
| **Benefit** | API responds instantly — doesn't wait for email to send or import to finish |
| **When to add** | When email sending or imports start slowing down API responses |

---

## VPC Network Architecture

```
VPC: 10.0.0.0/16 (metfold-vpc)
│
├── Public Subnets (internet access via Internet Gateway)
│   ├── 10.0.1.0/24  (ap-southeast-2a)  ← ALB, NAT Gateway
│   └── 10.0.2.0/24  (ap-southeast-2b)  ← ALB (multi-AZ)
│
├── Private Subnets (no direct internet — outbound via NAT Gateway)
│   ├── 10.0.3.0/24  (ap-southeast-2a)  ← ECS tasks, DocumentDB
│   └── 10.0.4.0/24  (ap-southeast-2b)  ← ECS tasks, DocumentDB (multi-AZ)
│
├── Internet Gateway: metfold-igw
├── NAT Gateway: metfold-nat (in public subnet — allows private subnet outbound)
│
└── Route Tables:
    ├── Public RT:  0.0.0.0/0 → Internet Gateway
    └── Private RT: 0.0.0.0/0 → NAT Gateway
```

### Why NAT Gateway?
ECS tasks in private subnets need outbound internet for:
- Pulling Docker images from ECR
- Sending emails via SES
- Stripe API calls
- Google OAuth calls

NAT Gateway cost: ~$35/month. Alternative: VPC Endpoints for ECR/S3/SES (~$10/month each) to avoid NAT.

---

## Final Stack & Costs

| Service | AWS Service | Monthly Cost |
|---------|------------|-------------|
| **Email** | Amazon SES | ~$2 |
| **Images** | S3 + CloudFront | ~$10 |
| **Database** | DocumentDB (db.t3.medium) | ~$60 |
| **Backend hosting** | ECS Fargate (0.5 vCPU, 1 GB) | ~$25 |
| **Frontend hosting** | ECS Fargate (0.5 vCPU, 1 GB) | ~$20 |
| **Load balancer** | ALB | ~$30 |
| **Domain/DNS** | Route 53 | ~$1 |
| **SSL** | ACM | FREE |
| **Secrets** | Secrets Manager | ~$5 |
| **Security** | WAF + Shield Standard | ~$12 |
| **Monitoring** | CloudWatch + SNS | ~$13 |
| **CI/CD** | CodePipeline + CodeBuild + ECR | ~$5 |
| **Networking** | NAT Gateway | ~$35 |
| **Container Registry** | ECR | ~$2 |
| **Total** | | **~$220-260/month** |

*Add later: ElastiCache Redis (~$20/month), SQS + Lambda (~$2/month)*

---

## Architecture Diagram

```
                         Customer Browser
                               │
                        ┌──────▼──────┐
                        │  Route 53   │  metfoldsm.com.au
                        └──┬───────┬──┘
                           │       │
                 ┌─────────▼──┐  ┌─▼──────────────┐
                 │    ALB     │  │   CloudFront    │
                 │  (HTTPS)   │  │  (Image CDN)    │
                 │  + WAF     │  │ images.metfoldsm│
                 └──┬──────┬──┘  └───────┬─────────┘
                    │      │             │
                    │      │      ┌──────▼──────┐
                    │      │      │   S3 Bucket  │
                    │      │      │ metfold-images│
                    │      │      └──────────────┘
       ┌────────────▼┐   ┌▼───────────┐
       │    ECS      │   │    ECS     │     AWS VPC (Private Subnets)
       │  Frontend   │   │  Backend   │     ──────────────────────────
       │  Next.js    │   │  Express   │
       └─────────────┘   └──┬──┬──┬──┘
                             │  │  │
              ┌──────────────┘  │  └──────────────┐
              │                 │                  │
       ┌──────▼───────┐  ┌─────▼──────┐   ┌──────▼───────┐
       │  DocumentDB  │  │ Amazon SES │   │   S3 Bucket  │
       │  (Database)  │  │  (Email)   │   │  (Images)    │
       │  Private     │  │ OTP/Orders │   │  Upload/Del  │
       └──────────────┘  └────────────┘   └──────────────┘

   ┌──────────────────────────────────────────────────────────────┐
   │ Supporting Services:                                         │
   │ Secrets Manager │ CloudWatch │ CodePipeline │ ACM │ IAM │ ECR│
   └──────────────────────────────────────────────────────────────┘
```

---

## What Changes in Code vs What Stays Same

| Component | Change? | Details |
|-----------|---------|---------|
| Mongoose queries | NO CHANGE | DocumentDB is MongoDB-compatible, same Mongoose queries |
| **Image upload service** | **REWRITE** | Replace Cloudinary SDK with AWS S3 SDK + Sharp |
| **Image URLs in DB** | **MIGRATE** | Update all stored URLs from Cloudinary to CloudFront |
| **env.ts config** | **UPDATE** | Replace Cloudinary vars with AWS vars (S3, CloudFront, Region) |
| **package.json** | **UPDATE** | Remove `cloudinary`, add `@aws-sdk/client-s3`, `sharp` |
| Nodemailer email | NO CHANGE | Same library, only `.env` SMTP values change |
| Stripe payments | NO CHANGE | Stripe works everywhere |
| Google OAuth | NO CHANGE | Just update redirect URI in Google Console |
| JWT auth | NO CHANGE | Same logic, secrets from Secrets Manager |
| Docker images | NO CHANGE | Same Dockerfiles, push to ECR instead |
| `.env` file | REPLACED | Secrets Manager injects env vars into ECS containers |
| Frontend API URL | CHANGE | `NEXT_PUBLIC_API_URL=https://api.metfoldsm.com.au/api/v1` |
| CORS origin | CHANGE | `CORS_ORIGIN=https://onlinestore.metfoldsm.com.au` |
| DB connection string | CHANGE | DocumentDB URI with `retryWrites=false` |

---

## Migration Checklist

### Week 1 — AWS Foundation
- [ ] Create AWS account, enable MFA, set up billing alerts ($50 budget alarm)
- [ ] Create VPC with public + private subnets (2 AZs)
- [ ] Create Internet Gateway + NAT Gateway
- [ ] Set up Route 53 hosted zone for `metfoldsm.com.au`
- [ ] Update domain registrar nameservers to Route 53
- [ ] Request ACM SSL certificate (`*.metfoldsm.com.au`)
- [ ] Create IAM roles (ECS task role, ECS execution role, CodeBuild role)
- [ ] Store all secrets in Secrets Manager
- [ ] Create security groups (ALB, ECS, DocumentDB)

### Week 2 — Database + Images
- [ ] Create DocumentDB cluster (db.t3.medium, private subnet)
- [ ] Migrate data: `mongodump` from Atlas → `mongorestore` to DocumentDB
- [ ] Test: connect backend locally to DocumentDB (via bastion/VPN) — verify all queries work
- [ ] Create S3 bucket `metfold-images` (private, versioned)
- [ ] Create CloudFront distribution → S3 origin with OAC
- [ ] Route 53: `images.metfoldsm.com.au` → CloudFront
- [ ] Rewrite `upload.service.ts` (Cloudinary → S3 + Sharp)
- [ ] Update `env.ts` with new AWS variables
- [ ] Update `package.json` — remove cloudinary, add @aws-sdk/client-s3 + sharp
- [ ] Write migration script: download Cloudinary images → upload to S3 → update DB URLs
- [ ] Run image migration script
- [ ] Test: admin upload new product images → verify S3 + CloudFront serving

### Week 3 — Deploy Application
- [ ] Create ECR repositories (metfold-backend, metfold-frontend)
- [ ] Build & push Docker images to ECR
- [ ] Create ECS cluster (Fargate)
- [ ] Create task definitions (backend + frontend) with Secrets Manager refs
- [ ] Create ALB with HTTPS listener + host-based routing rules
- [ ] Create ECS services linked to ALB target groups
- [ ] Route 53: `api.metfoldsm.com.au` → ALB, `onlinestore.metfoldsm.com.au` → ALB
- [ ] Test: browse site via `onlinestore.metfoldsm.com.au`
- [ ] Test: API calls via `api.metfoldsm.com.au`

### Week 4 — Email + Security + Monitoring
- [ ] Set up Amazon SES — verify domain, add DKIM records in Route 53
- [ ] Request SES production access (exit sandbox)
- [ ] Create SES SMTP credentials → store in Secrets Manager
- [ ] Test: registration OTP, password reset OTP, order confirmation emails
- [ ] Set up WAF on ALB (managed rule groups)
- [ ] Create CloudWatch log groups for ECS
- [ ] Create CloudWatch dashboard "Metfold-Production"
- [ ] Create CloudWatch alarms (5xx errors, CPU, health checks, DB CPU)
- [ ] Create SNS topic → subscribe your email for alarm notifications

### Week 5 — CI/CD + Final Testing + Go Live
- [ ] Create CodeBuild project with buildspec.yml
- [ ] Create CodePipeline: GitHub → CodeBuild → ECS Deploy
- [ ] Test: git push → auto-deploy → verify changes live
- [ ] Full end-to-end testing:
  - [ ] User registration (OTP email via SES)
  - [ ] Login (JWT from Secrets Manager)
  - [ ] Browse products (images from S3/CloudFront)
  - [ ] Add to cart + checkout (Stripe)
  - [ ] Order confirmation email (SES)
  - [ ] Admin: upload product images (S3)
  - [ ] Admin: manage products, categories, orders
  - [ ] Password reset (OTP email via SES)
  - [ ] Google OAuth login
- [ ] Delete MongoDB Atlas cluster (after confirming DocumentDB is stable)
- [ ] Delete Cloudinary images (after confirming S3 migration is complete)
- [ ] **GO LIVE**
