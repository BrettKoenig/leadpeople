import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export function Settings() {
  const { user, fetchUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await api.put('/api/auth/profile', { name, email });
      setMessage('Profile updated successfully');
      await fetchUser();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/api/auth/password', {
        currentPassword,
        newPassword,
      });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/subscriptions/create-portal-session');
      window.location.href = response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to open billing portal');
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="settings-grid">
        {/* Profile Settings */}
        <div className="settings-card">
          <h2>Profile Information</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="settings-card">
          <h2>Change Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Subscription Settings */}
        <div className="settings-card">
          <h2>Subscription</h2>
          <div className="subscription-info">
            {user?.subscription?.status === 'active' ? (
              <>
                <p className="status-active">
                  <strong>Status:</strong> Active Pro Subscription
                </p>
                <p>
                  <strong>Next billing date:</strong>{' '}
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <button
                  onClick={handleManageSubscription}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Manage Subscription
                </button>
                <p className="help-text">
                  Cancel your subscription, update payment method, or view billing history
                </p>
              </>
            ) : (
              <>
                <p className="status-inactive">
                  <strong>Status:</strong> Free Plan
                </p>
                <p>Upgrade to Pro for unlimited contacts and premium features</p>
                <a href="/pricing" className="btn-primary">
                  Upgrade to Pro
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
