import { useState, useEffect } from 'react';
import { FiHeart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toggleBookmark, deleteIdea, isIdeaBookmarked } from '../firebase/ideas';
import { toast } from 'react-hot-toast';
import TagChip from './TagChip';
import StarRating from './StarRating';

const IdeaCard = ({ idea, onEdit, onDeleted, onOpenDetail }) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser && idea.userId === currentUser.uid;

  // Check bookmark status from the user's own subcollection
  const arrayIncludesUser = currentUser && idea.bookmarkedBy?.includes(currentUser.uid);
  const [localBookmarked, setLocalBookmarked] = useState(arrayIncludesUser);
  const [bookmarkCount, setBookmarkCount] = useState(idea.bookmarkedBy?.length || 0);
  const [deleting, setDeleting] = useState(false);

  // Check the user's personal bookmark subcollection on mount
  // and fix the count if it's out of sync with the array
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    isIdeaBookmarked(idea.id, currentUser.uid).then(bookmarked => {
      if (cancelled) return;
      setLocalBookmarked(bookmarked);
      // Fix count: if subcollection says bookmarked but array doesn't include user, add 1
      if (bookmarked && !arrayIncludesUser) {
        setBookmarkCount(v => v + 1);
      }
      // If subcollection says NOT bookmarked but array includes user, subtract 1
      if (!bookmarked && arrayIncludesUser) {
        setBookmarkCount(v => Math.max(0, v - 1));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [idea.id, currentUser]);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!currentUser) { toast.error('Sign in to bookmark ideas'); return; }
    const wasBookmarked = localBookmarked;
    setLocalBookmarked(!wasBookmarked);
    setBookmarkCount(v => wasBookmarked ? v - 1 : v + 1);
    try {
      await toggleBookmark(idea.id, currentUser.uid, wasBookmarked);
    } catch {
      setLocalBookmarked(wasBookmarked);
      setBookmarkCount(v => wasBookmarked ? v + 1 : v - 1);
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
    if (idea.tags?.subIndustry) tags.push({ label: idea.tags.subIndustry, type: 'sub' });
    return tags;
  };

  const getThumbnailSrc = () => {
    if (idea.thumbnailUrl) return idea.thumbnailUrl;
    if (!idea.link) return null;

    const url = idea.link;

    // Instagram
    if (url.includes('instagram.com')) {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
    }

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
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
    }

    // Twitter / X
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&embed=image.url`;
    }

    // Facebook handled separately via useEffect below
    return null;
  };

  const dynamicThumb = getThumbnailSrc();

  // For Facebook, we need to fetch the thumbnail via noembed API
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
        // Try noembed first
        const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(idea.link)}`);
        const data = await noembed.json();
        if (!cancelled && data.thumbnail_url) {
          setFbThumb(data.thumbnail_url);
          return;
        }
      } catch {}

      // Fallback: try microlink
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
    <div className="idea-card" onClick={() => onOpenDetail?.(idea)}>
      {/* Thumbnail */}
      <div className="card-thumb-wrap">
        {finalThumb ? (
          <img src={finalThumb} alt={idea.title} className="card-thumb" />
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
