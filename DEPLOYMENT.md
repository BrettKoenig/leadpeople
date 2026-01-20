# LeadPeople Deployment Guide

This guide will walk you through deploying LeadPeople to production.

## Prerequisites

1. A GitHub account
2. A Railway account (https://railway.app)
3. A Vercel account (https://vercel.com)
4. A Stripe account with API keys

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: LeadPeople CRM application"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your LeadPeople repository
5. Railway will detect the backend automatically

### 2.2 Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision the database and set `DATABASE_URL`

### 2.3 Configure Environment Variables

In your Railway project settings, add these variables:

```
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PRICE_ID=<your-stripe-price-id>
STRIPE_WEBHOOK_SECRET=<will-set-this-after-webhook-setup>
FRONTEND_URL=<will-set-after-frontend-deployment>
PORT=3001
```

To generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Set Root Directory

1. Go to your backend service settings in Railway
2. Under "Settings" → "Root Directory", set it to `backend`
3. Under "Settings" → "Start Command", set it to `npm run build && npm run start`

### 2.5 Run Database Migration

After the first deployment:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

### 2.6 Note Your Backend URL

Railway will provide you with a URL like: `https://leadpeople-backend-production.up.railway.app`

Save this URL for the next steps.

## Step 3: Set Up Stripe

### 3.1 Create Product and Price

1. Go to Stripe Dashboard → Products
2. Click "Add Product"
3. Name: "LeadPeople Pro"
4. Description: "Unlimited contacts and premium features"
5. Set pricing: $9.99/month (or your preferred price)
6. Click "Save product"
7. Copy the Price ID (starts with `price_`)

### 3.2 Set Up Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend-url.railway.app/api/subscriptions/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the Signing Secret (starts with `whsec_`)

### 3.3 Update Railway Environment Variables

Go back to Railway and update:
- `STRIPE_PRICE_ID`: Your price ID from step 3.1
- `STRIPE_WEBHOOK_SECRET`: Your webhook secret from step 3.2

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will detect it's a Vite project

### 4.2 Configure Build Settings

1. Root Directory: Set to `frontend`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`

### 4.3 Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend-url.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

Get your Stripe publishable key from: Stripe Dashboard → Developers → API keys

### 4.4 Deploy

Click "Deploy"

Vercel will build and deploy your frontend. You'll get a URL like: `https://leadpeople.vercel.app`

### 4.5 Update Backend Environment Variable

Go back to Railway and update:
- `FRONTEND_URL`: Your Vercel URL

Redeploy the backend service for the CORS settings to take effect.

## Step 5: Verify Deployment

### 5.1 Test Authentication

1. Visit your Vercel URL
2. Click "Sign up"
3. Create a test account
4. Verify you can log in

### 5.2 Test Contact Creation

1. Go to Contacts
2. Add a new contact
3. Verify it saves correctly

### 5.3 Test Stripe Integration

1. Go to Pricing
2. Click "Subscribe Now"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date
5. Any 3-digit CVC
6. Verify the subscription is created

### 5.4 Check Webhook

1. Make a test subscription
2. Go to Stripe Dashboard → Developers → Webhooks
3. Check your webhook endpoint
4. Verify events are being received successfully

## Step 6: Custom Domain (Optional)

### 6.1 Frontend Domain

1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 6.2 Backend Domain

1. In Railway project → Settings → Domains
2. Add your custom domain
3. Update Stripe webhook URL if needed
4. Update `VITE_API_URL` in Vercel

## Troubleshooting

### Backend Not Starting

- Check Railway logs for errors
- Verify all environment variables are set
- Ensure database migrations ran successfully

### Frontend Can't Connect to Backend

- Verify `VITE_API_URL` is correct in Vercel
- Check Railway backend is running
- Verify CORS is configured correctly

### Stripe Webhook Failing

- Check webhook signature matches `STRIPE_WEBHOOK_SECRET`
- Verify webhook URL is correct
- Check Railway logs for webhook errors

### Database Connection Issues

- Verify `DATABASE_URL` is set in Railway
- Check PostgreSQL service is running
- Ensure migrations have been run

## Monitoring

### Railway

- View logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel

- Check deployment logs
- Monitor function execution
- Review error tracking

### Stripe

- Monitor webhook delivery
- Check for failed payments
- Review subscription metrics

## Backup Strategy

### Database Backups

Railway automatically backs up PostgreSQL. To manually backup:

```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
railway run psql $DATABASE_URL < backup.sql
```

## Updating the Application

### Backend Updates

1. Push changes to GitHub
2. Railway will automatically redeploy
3. Run migrations if needed: `railway run npx prisma migrate deploy`

### Frontend Updates

1. Push changes to GitHub
2. Vercel will automatically redeploy

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] JWT_SECRET is a strong random string
- [ ] Database has strong credentials
- [ ] CORS is configured to only allow your frontend domain
- [ ] Stripe webhook signature verification is enabled
- [ ] SSL/HTTPS is enabled (automatic on Railway and Vercel)
- [ ] API rate limiting is configured (consider adding)
- [ ] Regular security updates are applied

## Cost Estimates

### Railway (Backend + Database)
- Starter: $5/month per service ($10 total)
- Includes PostgreSQL and backend

### Vercel (Frontend)
- Hobby: Free for personal projects
- Pro: $20/month if needed for commercial use

### Stripe
- No monthly fee
- 2.9% + 30¢ per transaction

## Support

If you encounter issues:
1. Check the logs in Railway and Vercel
2. Review this guide
3. Consult Railway and Vercel documentation
4. Check Stripe documentation for payment issues

## Next Steps

After deployment:
1. Set up monitoring and alerts
2. Configure custom domains
3. Add analytics (Google Analytics, Plausible, etc.)
4. Set up error tracking (Sentry)
5. Create a backup schedule
6. Plan feature updates
