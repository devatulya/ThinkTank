import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiPlusCircle, FiBookmark, FiGrid } from 'react-icons/fi';

const ProfilePage = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-card clay-card">
        <div className="profile-avatar-wrap">
          <img
            src={currentUser?.photoURL || '/avatar.png'}
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-glow" />
        </div>
        <h1 className="profile-name">{currentUser?.displayName || 'Creator'}</h1>
        <p className="profile-email">{currentUser?.email}</p>

        <div className="profile-quick-links">
          <button onClick={() => navigate('/add')} className="profile-quick-btn">
            <FiPlusCircle /> Add Idea
          </button>
          <button onClick={() => navigate('/library')} className="profile-quick-btn">
            <FiGrid /> Library
          </button>
          <button onClick={() => navigate('/saved')} className="profile-quick-btn">
            <FiBookmark /> Saved
          </button>
        </div>

        <div className="profile-info-box">
          <p className="profile-info-label">Account</p>
          <p className="profile-info-value">Google — {currentUser?.email}</p>
        </div>

        <button onClick={handleSignOut} className="signout-btn">
          <FiLogOut /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
