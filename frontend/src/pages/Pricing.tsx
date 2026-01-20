import { useState } from 'react';
import { Layout } from '../components/Layout';
import { loadStripe } from '@stripe/stripe-js';
import api from '../lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function Pricing() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/subscriptions/create-checkout-session');
      const stripe = await stripePromise;

      if (stripe && response.data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="pricing-page">
        <h1>Upgrade to Pro</h1>
        <p className="subtitle">
          Unlock unlimited contacts and advanced features
        </p>

        <div className="pricing-card">
          <h2>Pro Plan</h2>
          <div className="price">
            <span className="amount">$9.99</span>
            <span className="period">/month</span>
          </div>

          <ul className="features-list">
            <li>Unlimited contacts</li>
            <li>Track all interactions</li>
            <li>Advanced notes and tags</li>
            <li>Follow-up reminders</li>
            <li>Export your data</li>
            <li>Priority support</li>
          </ul>

          <button
            onClick={handleSubscribe}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
