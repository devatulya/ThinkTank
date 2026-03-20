import { useState, useRef } from 'react';
import { addIdea, updateIdea } from '../firebase/ideas';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import StarRating from '../components/StarRating';
import TagChip from '../components/TagChip';
import { FiUpload, FiX, FiLink, FiSave } from 'react-icons/fi';

const HOOK_TYPES = ['emotional', 'funny', 'shocking', 'relatable', 'inspiring', 'educational'];
const FORMATS = ['reel', 'carousel', 'storytelling', 'meme', 'ugc', 'tutorial'];
const INDUSTRIES = ['fashion', 'gifting', 'fintech', 'food', 'beauty', 'tech', 'fitness', 'travel'];

const EMPTY_FORM = {
  title: '', link: '', hook: '', whyLiked: '', whyWorks: '',
  tags: { hookType: '', format: '', industry: '' }, rating: 0,
};

const AddIdeaPage = ({ editIdea = null, onEditDone }) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState(editIdea ? {
    title: editIdea.title || '',
    link: editIdea.link || '',
    hook: editIdea.hook || '',
    whyLiked: editIdea.whyLiked || '',
    whyWorks: editIdea.whyWorks || '',
    tags: editIdea.tags || { hookType: '', format: '', industry: '' },
    rating: editIdea.rating || 0,
  } : EMPTY_FORM);

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(editIdea?.thumbnailUrl || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTag = (type, value) =>
    setForm(prev => ({
      ...prev,
      tags: { ...prev.tags, [type]: prev.tags[type] === value ? '' : value },
    }));

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editIdea) {
        await updateIdea(editIdea.id, form, thumbnail, currentUser.uid);
        toast.success('Idea updated! ✨');
        onEditDone?.();
      } else {
        await addIdea(form, currentUser.uid, thumbnail);
        toast.success('Idea saved! 🎉');
        setForm(EMPTY_FORM);
        setThumbnail(null);
        setThumbPreview(null);
      }
    } catch (err) {
      toast.error('Failed to save idea. Check your Firebase config.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-page">
      <div className="add-page-header">
        <h1 className="page-title">{editIdea ? '✏️ Edit Idea' : '✦ Capture a New Idea'}</h1>
        <p className="page-subtitle">Save creative inspiration before it slips away</p>
      </div>

      <form onSubmit={handleSubmit} className="add-form clay-card">
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Give this idea a memorable name..."
            className="form-input"
            id="idea-title"
          />
        </div>

        {/* Link */}
        <div className="form-group">
          <label className="form-label"><FiLink /> Content Link</label>
          <input
            type="url"
            value={form.link}
            onChange={e => handleChange('link', e.target.value)}
            placeholder="https://..."
            className="form-input"
            id="idea-link"
          />
        </div>

        {/* Hook */}
        <div className="form-group">
          <label className="form-label hook-label-star">⭐ Hook — The most important part</label>
          <input
            type="text"
            value={form.hook}
            onChange={e => handleChange('hook', e.target.value)}
            placeholder="What's the hook that made this resonate?"
            className="form-input hook-input"
            id="idea-hook"
          />
        </div>

        {/* Why I liked it */}
        <div className="form-group">
          <label className="form-label">❤️ Why I Liked This</label>
          <textarea
            value={form.whyLiked}
            onChange={e => handleChange('whyLiked', e.target.value)}
            placeholder="What first grabbed your attention?"
            className="form-textarea"
            rows={3}
            id="idea-why-liked"
          />
        </div>

        {/* Why it works */}
        <div className="form-group">
          <label className="form-label">🧠 Why This Works</label>
          <textarea
            value={form.whyWorks}
            onChange={e => handleChange('whyWorks', e.target.value)}
            placeholder="Break down the psychology or structure behind it..."
            className="form-textarea"
            rows={3}
            id="idea-why-works"
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">🏷️ Hook Type</label>
          <div className="chip-selector">
            {HOOK_TYPES.map(h => (
              <button key={h} type="button"
                className={`chip-option ${form.tags.hookType === h ? 'selected-purple' : ''}`}
                onClick={() => handleTag('hookType', h)}>{h}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📐 Format</label>
          <div className="chip-selector">
            {FORMATS.map(f => (
              <button key={f} type="button"
                className={`chip-option ${form.tags.format === f ? 'selected-blue' : ''}`}
                onClick={() => handleTag('format', f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">🏭 Industry</label>
          <div className="chip-selector">
            {INDUSTRIES.map(i => (
              <button key={i} type="button"
                className={`chip-option ${form.tags.industry === i ? 'selected-pink' : ''}`}
                onClick={() => handleTag('industry', i)}>{i}</button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="form-group">
          <label className="form-label">⭐ Rating</label>
          <StarRating value={form.rating} onChange={r => handleChange('rating', r)} size="lg" />
        </div>

        {/* Thumbnail */}
        <div className="form-group">
          <label className="form-label">🖼️ Thumbnail (optional)</label>
          {thumbPreview ? (
            <div className="thumb-preview-wrap">
              <img src={thumbPreview} alt="preview" className="thumb-preview" />
              <button type="button" onClick={() => { setThumbnail(null); setThumbPreview(null); }} className="thumb-remove"><FiX /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current.click()} className="thumb-upload-btn">
              <FiUpload /> Upload Image
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
        </div>

        <button type="submit" disabled={saving} className="brutal-btn btn-save-idea" id="save-idea-btn">
          <FiSave /> {saving ? 'Saving…' : editIdea ? 'Update Idea' : 'Save Idea'}
        </button>
      </form>
    </div>
  );
};

export default AddIdeaPage;
