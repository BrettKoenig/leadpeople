# Production Setup Guide

## Feature Flags

Two new environment variables have been added to control application behavior:

### ALLOW_REGISTRATION
- **Purpose**: Control whether new users can sign up
- **Default**: `true`
- **Usage**: Set to `"false"` to disable new user registrations
- **Location**: Backend environment variables

### STRIPE_MODE
- **Purpose**: Document whether test or production Stripe keys are configured
- **Values**: `"test"` or `"production"`
- **Default**: `"test"`
- **Location**: Backend environment variables (for documentation only)

## Current Configuration Status

### ✅ Completed
- Feature flags added to Railway backend
- Production Stripe publishable key configured in Vercel
- Backend code ready for production mode
- Registration toggle implemented

### ⚠️ Requires Manual Setup

The following Stripe production resources must be created via the Stripe Dashboard at https://dashboard.stripe.com (switch to **Live mode**):

#### 1. Create Production Product
- Navigate to: Products → Create product
- **Name**: LeadPeople Pro
- **Description**: Unlimited contacts and premium features
- **Pricing**: $9.99/month recurring

#### 2. Create Production Webhook
- Navigate to: Developers → Webhooks → Add endpoint
- **URL**: `https://backend-production-86de.up.railway.app/api/subscriptions/webhook`
- **Events to send**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Note**: Save the webhook signing secret (starts with `whsec_`)

#### 3. Get Production Secret Key
- Navigate to: Developers → API keys
- Create or reveal a **Secret key** (starts with `sk_live_`)
- ⚠️ **Security**: Keep this key secure and never commit it to version control

## Railway Environment Variables to Update

Once you have created the production Stripe resources, update these environment variables in Railway:

```bash
railway variables set STRIPE_SECRET_KEY=sk_live_... --service backend
railway variables set STRIPE_PRICE_ID=price_... --service backend
railway variables set STRIPE_WEBHOOK_SECRET=whsec_... --service backend
railway variables set STRIPE_MODE=production --service backend
```

## Vercel Environment Variables

The production publishable key has already been configured:
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_live_51P2Y77DNJMngvt7aludX0fOkxYfJ5GBerK8ASFsLGF4kendXb6Jdh37yHaBHPL8BU1nixX8WCvRDUeOk8r7h9u6m00TxnM0Gsw`

## Testing Production Setup

After configuring all production Stripe keys:

1. **Test Registration Toggle**:
   ```bash
   # Disable registration
   railway variables set ALLOW_REGISTRATION=false --service backend

   # Try signing up - should see "Registration is currently disabled"

   # Re-enable registration
   railway variables set ALLOW_REGISTRATION=true --service backend
   ```

2. **Test Production Payments**:
   - Navigate to https://frontend-psi-lyart-36.vercel.app/pricing
   - Complete checkout with a real credit card
   - Verify subscription is created in Stripe Dashboard
   - Verify "Pro" badge appears in navbar

3. **Test Webhook**:
   - Monitor webhook events in Stripe Dashboard → Developers → Webhooks
   - Verify all subscription events are successfully delivered
   - Check Railway logs for webhook processing

## Current Stripe Account

- **Display Name**: For-emailer
- **Account ID**: `acct_1P2Y77DNJMngvt7a`
- **Dashboard**: https://dashboard.stripe.com/acct_1P2Y77DNJMngvt7a

## Security Notes

1. Never commit `.env` files with production keys
2. Rotate secret keys if they are ever exposed
3. Use webhook signature verification (already implemented)
4. Monitor Stripe Dashboard for suspicious activity
5. Set up Stripe email alerts for important events

## Existing Production Resources

Note: There are existing products in your Stripe account:
- **Standard** ($10/month) - `prod_TWwaVcbavDuSdh` / `price_1SZsgvDNJMngvt7a0fpcAUXm`
- **Starter Plan** ($1/month) - `prod_PsJ7W6NBQKu630` / `price_1P2YUoDNJMngvt7auzbOT7RY`

You can either:
- Create a new "LeadPeople Pro" product at $9.99/month (recommended)
- Reuse the "Standard" product at $10/month if that price works for you
