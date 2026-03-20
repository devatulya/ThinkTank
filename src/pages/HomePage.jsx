import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiZap } from 'react-icons/fi';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ── HERO (NEOBRUTALISM EXACT) ── */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="section-label">Creative Think Tank</span>
          <h1 className="hero-title">
            Where Great <br />
            <span className="highlight-red">Content Ideas</span> <br />
            Live
          </h1>
          <p className="hero-sub">
            A brutal, distraction-free library of high-performing creative hooks, formats, and stealable patterns.
          </p>
          <div className="hero-cta-group">
            <button onClick={() => navigate('/login')} className="brutal-btn">
              Get Started <FiArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-visual desktop-only">
          <div className="brutal-square-back"></div>
          <div className="brutal-square-mid"></div>
          <div className="brutal-square-front">💡</div>
        </div>
      </section>

      {/* ── MARQUEE (Like reference site) ── */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>Ideate Faster</span> <span className="marquee-star">✦</span>
          <span>Analyze Hooks</span> <span className="marquee-star">✦</span>
          <span>Find Patterns</span> <span className="marquee-star">✦</span>
          <span>No Distractions</span> <span className="marquee-star">✦</span>
          <span>Ideate Faster</span> <span className="marquee-star">✦</span>
          <span>Analyze Hooks</span> <span className="marquee-star">✦</span>
          <span>Find Patterns</span> <span className="marquee-star">✦</span>
          <span>No Distractions</span> <span className="marquee-star">✦</span>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
