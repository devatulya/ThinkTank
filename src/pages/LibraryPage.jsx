import { useState, useEffect, useMemo } from 'react';
import { getIdeas } from '../firebase/ideas';
import IdeaCard from '../components/IdeaCard';
import IdeaModal from '../components/IdeaModal';
import SearchFilterBar from '../components/SearchFilterBar';
import AddIdeaPage from './AddIdeaPage';
import { FiRefreshCw } from 'react-icons/fi';
import { RiSparkling2Fill } from 'react-icons/ri';

const LibraryPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ minRating: 0, formats: [], industries: [], hooks: [] });
  const [sort, setSort] = useState('newest');
  const [selectedIdea, setSelected] = useState(null);
  const [editingIdea, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const loadIdeas = async () => {
    setLoading(true); setError(null);
    try { setIdeas(await getIdeas()); }
    catch (err) { setError('Unable to load ideas. Check your Firebase configuration.'); console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadIdeas(); }, []);

  const handleRandom = () => {
    if (!filtered.length) return;
    setSelected(filtered[Math.floor(Math.random() * filtered.length)]);
  };

  const filtered = useMemo(() => {
    let r = [...ideas];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        i.title?.toLowerCase().includes(q) || i.hook?.toLowerCase().includes(q) ||
        i.tags?.hookType?.toLowerCase().includes(q) || i.tags?.format?.toLowerCase().includes(q) ||
        i.tags?.industry?.toLowerCase().includes(q)
      );
    }
    if (filters.minRating > 0) r = r.filter(i => (i.rating || 0) >= filters.minRating);
    if (filters.formats?.length) r = r.filter(i => filters.formats.includes(i.tags?.format));
    if (filters.industries?.length) r = r.filter(i => filters.industries.includes(i.tags?.industry));
    if (filters.hooks?.length) r = r.filter(i => filters.hooks.includes(i.tags?.hookType));
    if (sort === 'highest-rated') r.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'most-bookmarked') r.sort((a, b) => (b.bookmarkedBy?.length || 0) - (a.bookmarkedBy?.length || 0));
    return r;
  }, [ideas, search, filters, sort]);

  if (editingIdea) return <AddIdeaPage editIdea={editingIdea} onEditDone={() => { setEditing(null); loadIdeas(); }} />;

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <h1 className="page-title">📚 Idea Library</h1>
          <p className="page-subtitle">{ideas.length} creative ideas captured</p>
        </div>
        <button onClick={handleRandom} className="brutal-btn" disabled={!filtered.length}>
          <RiSparkling2Fill /> Random
        </button>
      </div>

      <SearchFilterBar onSearch={setSearch} onFilter={setFilters} onSort={setSort} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={loadIdeas} className="retry-btn"><FiRefreshCw /> Retry</button>
        </div>
      )}

      {loading ? (
        <div className="cards-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="idea-card skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <h3>No ideas found</h3>
          <p>{ideas.length === 0 ? 'Start capturing your first creative inspiration!' : 'Try adjusting filters.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(idea => (
            <div key={idea.id}>
              <IdeaCard
                idea={idea}
                onEdit={setEditing}
                onDeleted={id => setIdeas(prev => prev.filter(i => i.id !== id))}
                onOpenDetail={setSelected}
              />
            </div>
          ))}
        </div>
      )}

      {selectedIdea && (
        <IdeaModal
          idea={selectedIdea}
          onClose={() => setSelected(null)}
          onEdit={idea => { setSelected(null); setEditing(idea); }}
          onDeleted={id => { setIdeas(prev => prev.filter(i => i.id !== id)); setSelected(null); }}
        />
      )}
    </div>
  );
};

export default LibraryPage;
