# LeadPeople - Quick Start Guide

Get LeadPeople running locally in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- PostgreSQL installed and running
- Stripe account (for testing subscriptions)

## Quick Setup

### 1. Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE leadpeople;

# Create user (optional, or use default postgres user)
CREATE USER leadpeople_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leadpeople TO leadpeople_user;

# Exit psql
\q
```

### 3. Set Up Backend

```bash
cd backend

# Dependencies are already installed from earlier
# If not: npm install

# Update .env file with your database credentials
# The file already exists, just verify DATABASE_URL is correct

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend should now be running on http://localhost:3001

### 4. Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Dependencies are already installed from earlier
# If not: npm install

# Update .env file (already created)
# Just verify VITE_API_URL points to http://localhost:3001

# Start frontend dev server
npm run dev
```

Frontend should now be running on http://localhost:5173

### 5. Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign up" and create an account
3. You should be redirected to the dashboard
4. Try adding a contact!

## Stripe Setup (Optional for Local Development)

If you want to test subscriptions locally:

### 1. Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Publishable key" (starts with `pk_test_`)
3. Copy your "Secret key" (starts with `sk_test_`)

### 2. Update Environment Files

**backend/.env:**
```
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PRICE_ID=price_your_price_id_here
```

**frontend/.env:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### 3. Create a Test Product

1. Go to https://dashboard.stripe.com/test/products
2. Create a product with a monthly price
3. Copy the Price ID (starts with `price_`)
4. Update `STRIPE_PRICE_ID` in backend/.env

### 4. Test Stripe Webhook Locally (Optional)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:3001/api/subscriptions/webhook

# Copy the webhook signing secret (starts with whsec_)
# Update STRIPE_WEBHOOK_SECRET in backend/.env

# Restart your backend server
```

## Common Issues

### Port Already in Use

If port 3001 or 5173 is already in use:

**Backend:**
Change `PORT` in `backend/.env` to a different port

**Frontend:**
The Vite dev server will automatically use the next available port

### Database Connection Error

Verify your `DATABASE_URL` in `backend/.env` matches your PostgreSQL setup:

```
postgresql://[user]:[password]@localhost:5432/leadpeople
```

### Prisma Client Not Generated

Run:
```bash
cd backend
npx prisma generate
```

### Cannot Find Module Errors

Reinstall dependencies:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Changes

1. Backend changes auto-reload with `tsx watch`
2. Frontend hot-reloads automatically with Vite
3. Database changes require new migrations:
   ```bash
   cd backend
   npx prisma migrate dev --name describe_your_change
   ```

### Viewing Database

Use Prisma Studio:
```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### API Testing

Test API endpoints with curl or tools like Postman:

```bash
# Health check
curl http://localhost:3001/health

# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Next Steps

1. Read the full README.md for detailed documentation
2. Check DEPLOYMENT.md when ready to deploy
3. Explore the codebase:
   - Backend routes in `backend/src/routes/`
   - Frontend pages in `frontend/src/pages/`
   - Database schema in `backend/prisma/schema.prisma`

## Need Help?

- Check the logs in your terminal
- Review the README.md for more details
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running

Happy coding! 🚀
