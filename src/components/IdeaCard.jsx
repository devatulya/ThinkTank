import { useState } from 'react';
import { FiHeart, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toggleBookmark, deleteIdea } from '../firebase/ideas';
import { toast } from 'react-hot-toast';
import TagChip from './TagChip';
import StarRating from './StarRating';

const IdeaCard = ({ idea, onEdit, onDeleted, onOpenDetail }) => {
  const { currentUser } = useAuth();
  const isBookmarked = currentUser && idea.bookmarkedBy?.includes(currentUser.uid);
  const isOwner = currentUser && idea.userId === currentUser.uid;
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(idea.bookmarkedBy?.length || 0);
  const [deleting, setDeleting] = useState(false);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!currentUser) { toast.error('Sign in to bookmark ideas'); return; }
    setLocalBookmarked(v => !v);
    setBookmarkCount(v => localBookmarked ? v - 1 : v + 1);
    try {
      await toggleBookmark(idea.id, currentUser.uid, localBookmarked);
    } catch {
      setLocalBookmarked(v => !v);
      setBookmarkCount(v => localBookmarked ? v + 1 : v - 1);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this idea?')) return;
    setDeleting(true);
    try {
      await deleteIdea(idea.id);
      toast.success('Idea deleted');
      onDeleted?.(idea.id);
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
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
    <div className="idea-card" onClick={() => onOpenDetail?.(idea)}>
      {/* Thumbnail */}
      <div className="card-thumb-wrap">
        {dynamicThumb ? (
          <img src={dynamicThumb} alt={idea.title} className="card-thumb" />
        ) : (
          <div className="card-thumb-placeholder">
            <span>💡</span>
          </div>
        )}
        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`bookmark-btn ${localBookmarked ? 'bookmarked' : ''}`}
          aria-label="Bookmark idea"
        >
          {localBookmarked ? <FaHeart /> : <FiHeart />}
          {bookmarkCount > 0 && <span className="bookmark-count">{bookmarkCount}</span>}
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 className="card-title">{idea.title}</h3>

        {idea.hook && (
          <div className="card-hook">
            <span className="hook-label">Hook</span>
            <p className="hook-text">"{idea.hook}"</p>
          </div>
        )}

        <div className="card-tags">
          {getTags().map((t, i) => (
            <TagChip key={i} label={t.label} type={t.type} />
          ))}
        </div>

        <StarRating value={idea.rating || 0} readOnly size="sm" />

        {idea.whyWorks && (
          <p className="card-excerpt">{idea.whyWorks.slice(0, 80)}{idea.whyWorks.length > 80 ? '…' : ''}</p>
        )}
      </div>

      {/* Footer actions */}
      {isOwner && (
        <div className="card-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit?.(idea)} className="card-action-btn edit">
            <FiEdit2 /> Edit
          </button>
          <button onClick={handleDelete} disabled={deleting} className="card-action-btn delete">
            <FiTrash2 /> {deleting ? '…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
