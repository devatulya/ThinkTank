import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';

const REEL_THUMBNAILS = [
  { img: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=400&auto=format&fit=crop', top: '10%', left: '5%', rot: -12, delay: 0 },
  { img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop', top: '20%', right: '10%', rot: 15, delay: 0.2 },
  { img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=400&auto=format&fit=crop', bottom: '15%', left: '15%', rot: -8, delay: 0.4 },
  { img: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop', bottom: '10%', right: '5%', rot: 20, delay: 0.1 },
  { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop', top: '50%', left: '-5%', rot: 35, delay: 0.5 },
  { img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', top: '40%', right: '-2%', rot: -25, delay: 0.3 },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page" style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      {/* Floating Background Reels */}
      <div className="floating-reels-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
        {REEL_THUMBNAILS.map((thumb, i) => (
          <div 
            key={i}
            className="mock-reel"
            style={{
              position: 'absolute',
              width: '180px',
              height: '320px',
              top: thumb.top,
              bottom: thumb.bottom,
              left: thumb.left,
              right: thumb.right,
              transform: `rotate(${thumb.rot}deg)`,
              border: '2.4px solid #000',
              backgroundImage: `url(${thumb.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '6px 6px 0px 0px #000',
              animation: `float 6s ease-in-out infinite alternate ${thumb.delay}s`
            }}
          />
        ))}
      </div>

      {/* Foreground Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', width: '100%', padding: '0 24px' }}>
        <h1 className="brutal-heading" style={{ fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px', textShadow: '4px 4px 0px var(--primary)' }}>
          CREATIVE <br/> HEADQUARTERS
        </h1>
        <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '48px', maxWidth: '600px', marginInline: 'auto' }}>
          Welcome inside the Think Tank. What are we building today?
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/add')}
            className="brutal-btn" 
            style={{ 
              flex: '1 1 300px', 
              aspectRatio: '16/9', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px', 
              gap: '16px',
              background: 'var(--primary)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <FiPlus size={48} />
            ADD IDEA
          </button>
          
          <button 
            onClick={() => navigate('/library')}
            className="brutal-btn brutal-btn-inverse"
            style={{ 
              flex: '1 1 300px', 
              aspectRatio: '16/9', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px', 
              gap: '16px',
              background: '#fff',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <FiSearch size={48} />
            SEARCH IDEA
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-20px) rotate(calc(var(--rot, 0deg) + 5deg)); }
        }
        .mock-reel { filter: grayscale(20%); transition: filter 0.3s; }
        @media (max-width: 768px) {
          .floating-reels-bg { opacity: 0.25 !important; }
          .mock-reel { width: 100px !important; height: 178px !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
