import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="logo">
            LeadPeople
          </Link>

          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}>
            <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link to="/contacts" onClick={closeMenu}>Contacts</Link>
            <Link to="/settings" onClick={closeMenu}>Settings</Link>
            {user?.subscription?.status === 'active' ? (
              <span className="pro-badge">Pro</span>
            ) : (
              <Link to="/pricing" onClick={closeMenu}>Upgrade</Link>
            )}
            <span className="user-email">{user?.email}</span>
            <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
