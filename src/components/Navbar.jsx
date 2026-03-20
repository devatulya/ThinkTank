import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiLogIn } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/login');

  const navLinks = [
    { to: '/dashboard', label: '🏠 Dashboard', protected: true },
    { to: '/add', label: '✦ Add Idea', protected: true },
    { to: '/library', label: '🔍 Search Idea', protected: true },
    { to: '/saved', label: '❤️ Saved', protected: true },
  ];

  const visibleLinks = navLinks.filter(l => !l.protected || currentUser);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="logo-link">
          <span className="logo-text">INFLUENZÉ</span><div className="logo-dot"></div>
        </NavLink>

        {/* Desktop links */}
        <div className="nav-links desktop-only">
          {visibleLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {currentUser ? (
             <div className="user-menu" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
               <span style={{ fontWeight: 700, fontSize: '14px' }}>Logged in</span>
               <button onClick={() => { signOut(); navigate('/'); }} className="brutal-btn brutal-btn-inverse" style={{ padding: '10px 16px', fontSize: '12px' }}>Sign Out</button>
             </div>
          ) : (
            <button onClick={handleSignIn} className="brutal-btn" style={{ padding: '10px 16px', fontSize: '13px' }}>
              <FiLogIn /> Sign In
            </button>
          )}

          {currentUser && (
            <button onClick={() => setMenuOpen(v => !v)} className="icon-btn mobile-only">
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && currentUser && (
        <div className="mobile-menu">
          {visibleLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
