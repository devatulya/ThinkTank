import { useState, useEffect } from 'react';
import { FiX, FiHeart, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toggleBookmark, deleteIdea, isIdeaBookmarked } from '../firebase/ideas';
import { toast } from 'react-hot-toast';
import TagChip from './TagChip';
import StarRating from './StarRating';

const IdeaModal = ({ idea, onClose, onEdit, onDeleted }) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser && idea.userId === currentUser.uid;
  const [localBookmarked, setLocalBookmarked] = useState(
    currentUser && idea.bookmarkedBy?.includes(currentUser.uid)
  );

  // Check the user's personal bookmark subcollection on mount
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    isIdeaBookmarked(idea.id, currentUser.uid).then(bookmarked => {
      if (!cancelled) setLocalBookmarked(bookmarked);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [idea.id, currentUser]);

  const handleBookmark = async () => {
    if (!currentUser) { toast.error('Sign in to bookmark ideas'); return; }
    const wasBookmarked = localBookmarked;
    setLocalBookmarked(!wasBookmarked);
    try {
      await toggleBookmark(idea.id, currentUser.uid, wasBookmarked);
    } catch {
      setLocalBookmarked(wasBookmarked);
      toast.error('Failed to update bookmark');
    }
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
    if (idea.tags?.subIndustry) tags.push({ label: idea.tags.subIndustry, type: 'sub' });
    return tags;
  };

  const getThumbnailSrc = () => {
    if (idea.thumbnailUrl) return idea.thumbnailUrl;
    if (!idea.link) return null;

    const url = idea.link;

    // YouTube — use direct thumbnail CDN
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = null;
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
          videoId = parsed.pathname.slice(1);
        } else {
          videoId = parsed.searchParams.get('v');
          if (!videoId) {
            const pathMatch = parsed.pathname.match(/\/(shorts|embed)\/([^/?]+)/);
            if (pathMatch) videoId = pathMatch[2];
          }
        }
      } catch {}
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Instagram, TikTok, Twitter/X — microlink
    if (url.includes('instagram.com') || url.includes('tiktok.com') ||
        url.includes('twitter.com') || url.includes('x.com')) {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
    }

    // Facebook handled separately via useEffect below
    return null;
  };

  const dynamicThumb = getThumbnailSrc();

  // Facebook thumbnail fetching
  const [fbThumb, setFbThumb] = useState(null);
  const isFacebookLink = idea.link && (
    idea.link.includes('facebook.com') ||
    idea.link.includes('fb.watch') ||
    idea.link.includes('fb.com')
  );

  useEffect(() => {
    if (!isFacebookLink || idea.thumbnailUrl) return;
    let cancelled = false;

    const fetchFbThumb = async () => {
      try {
        const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(idea.link)}`);
        const data = await noembed.json();
        if (!cancelled && data.thumbnail_url) {
          setFbThumb(data.thumbnail_url);
          return;
        }
      } catch {}

      try {
        const ml = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(idea.link)}`);
        const mlData = await ml.json();
        if (!cancelled && mlData?.data?.image?.url) {
          setFbThumb(mlData.data.image.url);
          return;
        }
      } catch {}
    };

    fetchFbThumb();
    return () => { cancelled = true; };
  }, [idea.link, isFacebookLink, idea.thumbnailUrl]);

  const finalThumb = isFacebookLink && !idea.thumbnailUrl ? fbThumb : dynamicThumb;

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
        {finalThumb && (
          <img src={finalThumb} alt={idea.title} className="modal-thumb" />
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
