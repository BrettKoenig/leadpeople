# LeadPeople

A personal CRM application for building better relationships at work. Track contacts, interactions, and manage your professional network effectively.

## Features

- **Authentication**: Secure JWT-based authentication
- **Contact Management**: Store and organize work contacts with detailed information
- **Interaction Tracking**: Log meetings, calls, emails, and other interactions
- **Notes & Tags**: Add context and categorize your contacts
- **Follow-up Reminders**: Never forget to follow up with important contacts
- **Stripe Subscriptions**: Monetization ready with Stripe integration
- **Responsive UI**: Clean, modern interface built with React

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Stripe for payments

### Frontend
- React 19 with TypeScript
- Vite
- React Router for navigation
- Zustand for state management
- Axios for API calls
- Stripe.js for payment processing

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account (for subscriptions)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/leadpeople"
   JWT_SECRET="your-secure-jwt-secret"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PRICE_ID="price_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   FRONTEND_URL="http://localhost:5173"
   PORT=3001
   ```

5. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   VITE_API_URL=http://localhost:3001
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Deployment

### Backend Deployment (Railway)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project and link it:
   ```bash
   cd backend
   railway init
   railway link
   ```

4. Add a PostgreSQL database:
   - Go to your Railway project dashboard
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` variable

5. Set environment variables in Railway dashboard:
   ```
   JWT_SECRET=your-secure-jwt-secret
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PORT=3001
   ```

6. Deploy:
   ```bash
   railway up
   ```

7. Run migrations on production:
   ```bash
   railway run npx prisma migrate deploy
   ```

8. Note your Railway backend URL (e.g., `https://your-app.railway.app`)

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

5. Set environment variables in Vercel dashboard:
   - Go to your Vercel project settings
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend.railway.app
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
     ```

6. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Stripe Webhook Setup

1. Get your production webhook endpoint:
   ```
   https://your-backend.railway.app/api/subscriptions/webhook
   ```

2. In Stripe Dashboard:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Enter your webhook URL
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. Copy the webhook signing secret and update your Railway environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Subscription**: Stripe subscription data
- **Contact**: Work contacts with detailed information
- **Interaction**: Logged interactions (meetings, calls, etc.)
- **Note**: Additional notes about contacts
- **Tag**: Labels for organizing contacts

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Interactions
- `GET /api/interactions` - List all interactions
- `GET /api/interactions/contact/:contactId` - Get interactions for a contact
- `POST /api/interactions` - Create interaction
- `PUT /api/interactions/:id` - Update interaction
- `DELETE /api/interactions/:id` - Delete interaction

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Subscriptions
- `POST /api/subscriptions/create-checkout-session` - Create Stripe checkout
- `POST /api/subscriptions/create-portal-session` - Create billing portal
- `POST /api/subscriptions/webhook` - Stripe webhook handler

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 30 days
- API endpoints are protected with authentication middleware
- Environment variables are used for sensitive data
- CORS is configured to allow only your frontend domain
- Stripe webhook signatures are verified

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
