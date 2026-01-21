import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
  subscription?: {
    status: string;
    currentPeriodEnd: string;
  };
}

export function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user && !user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, usersRes] = await Promise.all([
        api.get('/api/admin/settings'),
        api.get('/api/admin/users'),
      ]);
      setSettings(settingsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      if (err.response?.status === 403) {
        navigate('/dashboard');
      } else {
        setError('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSettingToggle = async (key: string, currentValue: string) => {
    try {
      const newValue = currentValue === 'true' ? 'false' : 'true';
      await api.put(`/api/admin/settings/${key}`, { value: newValue });
      setSettings(
        settings.map((s) => (s.key === key ? { ...s, value: newValue } : s))
      );
      setSuccess('Setting updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating setting:', err);
      setError('Failed to update setting');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAdminToggle = async (userId: string, currentIsAdmin: boolean) => {
    try {
      await api.put(`/api/admin/users/${userId}/admin`, {
        isAdmin: !currentIsAdmin,
      });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u
        )
      );
      setSuccess('User admin status updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating admin status:', err);
      setError(err.response?.data?.error || 'Failed to update admin status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInitializeSettings = async () => {
    try {
      const res = await api.post('/api/admin/settings/initialize');
      setSettings(res.data);
      setSuccess('Settings initialized successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error initializing settings:', err);
      setError('Failed to initialize settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading admin panel...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <h1>Admin Panel</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="admin-grid">
          {/* Settings Section */}
          <div className="admin-card">
            <div className="section-header">
              <h2>Feature Flags</h2>
              {settings.length === 0 && (
                <button
                  onClick={handleInitializeSettings}
                  className="btn-secondary"
                >
                  Initialize Settings
                </button>
              )}
            </div>

            {settings.length === 0 ? (
              <div className="empty-state">
                <p>No settings configured yet.</p>
                <p>Click "Initialize Settings" to create default settings.</p>
              </div>
            ) : (
              <div className="settings-list">
                {settings.map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <div className="setting-info">
                      <h3>{setting.label}</h3>
                      {setting.description && (
                        <p className="setting-description">
                          {setting.description}
                        </p>
                      )}
                      <span className="setting-key">{setting.key}</span>
                    </div>
                    <div className="setting-control">
                      {setting.type === 'boolean' ? (
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={setting.value === 'true'}
                            onChange={() =>
                              handleSettingToggle(setting.key, setting.value)
                            }
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={setting.value}
                          className="setting-input"
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users Section */}
          <div className="admin-card">
            <h2>User Management</h2>
            <div className="users-list">
              {users.map((u) => (
                <div key={u.id} className="user-item">
                  <div className="user-info">
                    <h3>{u.name || u.email}</h3>
                    <p className="user-email">{u.email}</p>
                    <div className="user-badges">
                      {u.isAdmin && (
                        <span className="badge badge-admin">Admin</span>
                      )}
                      {u.subscription?.status === 'active' && (
                        <span className="badge badge-pro">Pro</span>
                      )}
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => handleAdminToggle(u.id, u.isAdmin)}
                      className={
                        u.isAdmin ? 'btn-admin-remove' : 'btn-admin-grant'
                      }
                      disabled={u.id === user?.id && u.isAdmin}
                      title={
                        u.id === user?.id && u.isAdmin
                          ? 'Cannot remove your own admin status'
                          : ''
                      }
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
