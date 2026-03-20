import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="idea-card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h2 className="brutal-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          WELCOME BACK
        </h2>
        <p style={{ marginBottom: '24px', fontWeight: '500' }}>
          Sign in to access your creative library.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="brutal-btn" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            <FiLogIn />
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
