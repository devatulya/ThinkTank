import { useState, useEffect } from 'react';
import { getBookmarkedIdeas } from '../firebase/ideas';
import { useAuth } from '../contexts/AuthContext';
import IdeaCard from '../components/IdeaCard';
import IdeaModal from '../components/IdeaModal';
import AddIdeaPage from './AddIdeaPage';

const SavedPage = () => {
  const { currentUser } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [error, setError] = useState(null);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await getBookmarkedIdeas(currentUser.uid);
      setIdeas(data);
    } catch (err) {
      setError('Could not load saved ideas. Check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (currentUser) loadSaved(); }, [currentUser]);

  if (editingIdea) {
    return (
      <AddIdeaPage
        editIdea={editingIdea}
        onEditDone={() => { setEditingIdea(null); loadSaved(); }}
      />
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <h1 className="page-title">❤️ Saved Ideas</h1>
          <p className="page-subtitle">{ideas.length} bookmarked gems</p>
        </div>
      </div>

      {error && <div className="error-banner"><p>{error}</p></div>}

      {loading ? (
        <div className="cards-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="idea-card skeleton" />)}
        </div>
      ) : ideas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔖</span>
          <h3>No saved ideas yet</h3>
          <p>Tap the ❤️ heart on any idea card to bookmark it here.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={setEditingIdea}
              onDeleted={id => setIdeas(prev => prev.filter(i => i.id !== id))}
              onOpenDetail={setSelectedIdea}
            />
          ))}
        </div>
      )}

      {selectedIdea && (
        <IdeaModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onEdit={(idea) => { setSelectedIdea(null); setEditingIdea(idea); }}
          onDeleted={id => { setIdeas(prev => prev.filter(i => i.id !== id)); setSelectedIdea(null); }}
        />
      )}
    </div>
  );
};

export default SavedPage;
