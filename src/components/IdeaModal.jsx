import { useState } from 'react';
import { FiX, FiHeart, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toggleBookmark, deleteIdea } from '../firebase/ideas';
import { toast } from 'react-hot-toast';
import TagChip from './TagChip';
import StarRating from './StarRating';

const IdeaModal = ({ idea, onClose, onEdit, onDeleted }) => {
  const { currentUser } = useAuth();
  const isBookmarked = currentUser && idea.bookmarkedBy?.includes(currentUser.uid);
  const isOwner = currentUser && idea.userId === currentUser.uid;
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  const handleBookmark = async () => {
    if (!currentUser) { toast.error('Sign in to bookmark ideas'); return; }
    setLocalBookmarked(v => !v);
    try { await toggleBookmark(idea.id, currentUser.uid, localBookmarked); }
    catch { setLocalBookmarked(v => !v); toast.error('Failed to update bookmark'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this idea?')) return;
    try {
      await deleteIdea(idea.id);
      toast.success('Idea deleted');
      onDeleted?.(idea.id);
      onClose();
    } catch { toast.error('Failed to delete'); }
  };

  const getTags = () => {
    const tags = [];
    if (idea.tags?.hookType) tags.push({ label: idea.tags.hookType, type: 'hook' });
    if (idea.tags?.format) tags.push({ label: idea.tags.format, type: 'format' });
    if (idea.tags?.industry) tags.push({ label: idea.tags.industry, type: 'industry' });
    return tags;
  };

  const getThumbnailSrc = () => {
    if (idea.thumbnailUrl) return idea.thumbnailUrl;
    if (idea.link && (idea.link.includes('instagram.com') || idea.link.includes('tiktok.com') || idea.link.includes('youtube.com') || idea.link.includes('youtu.be') || idea.link.includes('twitter.com') || idea.link.includes('x.com'))) {
      return `https://api.microlink.io/?url=${encodeURIComponent(idea.link)}&embed=image.url`;
    }
    return null;
  };

  const dynamicThumb = getThumbnailSrc();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{idea.title}</h2>
          <div className="modal-header-actions">
            <button onClick={handleBookmark} className={`modal-bookmark-btn ${localBookmarked ? 'bookmarked' : ''}`}>
              {localBookmarked ? <FaHeart /> : <FiHeart />}
            </button>
            <button onClick={onClose} className="modal-close-btn"><FiX /></button>
          </div>
        </div>

        {/* Thumbnail */}
        {dynamicThumb && (
          <img src={dynamicThumb} alt={idea.title} className="modal-thumb" />
        )}

        {/* Hook - HERO */}
        {idea.hook && (
          <div className="modal-hook-block">
            <span className="modal-hook-label">⭐ Hook</span>
            <p className="modal-hook-text">"{idea.hook}"</p>
          </div>
        )}

        {/* Content */}
        <div className="modal-body">
          {idea.link && (
            <a href={idea.link} target="_blank" rel="noreferrer" className="modal-link">
              <FiExternalLink /> View Original Content
            </a>
          )}

          {idea.whyLiked && (
            <div className="modal-section">
              <h4 className="modal-section-title">❤️ Why I Liked This</h4>
              <p className="modal-section-text">{idea.whyLiked}</p>
            </div>
          )}

          {idea.whyWorks && (
            <div className="modal-section">
              <h4 className="modal-section-title">🧠 Why This Works</h4>
              <p className="modal-section-text">{idea.whyWorks}</p>
            </div>
          )}

          <div className="modal-meta">
            <div className="modal-tags">
              {getTags().map((t, i) => <TagChip key={i} label={t.label} type={t.type} />)}
            </div>
            <StarRating value={idea.rating || 0} readOnly size="md" />
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="modal-footer">
            <button onClick={() => { onEdit?.(idea); onClose(); }} className="modal-action-btn edit">
              <FiEdit2 /> Edit
            </button>
            <button onClick={handleDelete} className="modal-action-btn delete">
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaModal;
