import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="logo">
            LeadPeople
          </Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/contacts">Contacts</Link>
            {user?.subscription?.status === 'active' ? (
              <span className="pro-badge">Pro</span>
            ) : (
              <Link to="/pricing">Upgrade</Link>
            )}
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
