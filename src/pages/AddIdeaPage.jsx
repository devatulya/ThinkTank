import { useState } from 'react';
import { addIdea, updateIdea } from '../firebase/ideas';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import StarRating from '../components/StarRating';
import TagChip from '../components/TagChip';
import { FiLink, FiSave } from 'react-icons/fi';

const HOOK_TYPES = [
  'authority/expert', 'before-after', 'callout', 'contrarian', 'controversial',
  'curiosity gap', 'educational', 'emotional', 'fear-based', 'funny',
  'inspiring', 'myth busting', 'negative emotion', 'personal confession',
  'problem-solution', 'question-based', 'relatable', 'shocking',
  'story hook', 'trend-based', 'urgency/scarcity',
];
const FORMATS = [
  'animation/motion', 'behind the scenes', 'carousel', 'case study',
  'comparison', 'duet/remix', 'interview', 'meme', 'podcast clip',
  'pov', 'reaction', 'reel', 'screen recording', 'storytelling',
  'talking head', 'text-based video', 'tutorial', 'ugc', 'vlog', 'voiceover',
];

const INDUSTRY_MAP = {
  'automobile': ['accessories', 'bikes', 'cars', 'ev (electric vehicles)', 'reviews'],
  'beauty': ['beauty tools', 'dermatology', 'grooming (men)', 'haircare', 'makeup', 'organic/natural', 'skincare'],
  'business / startups': ['agencies', 'b2b services', 'consulting', 'saas', 'startups'],
  'e-commerce / d2c': ['clothing stores', 'dropshipping', 'marketplaces', 'niche products', 'subscription boxes'],
  'education (edtech)': ['career coaching', 'language learning', 'online courses', 'skill development', 'test prep'],
  'fashion': ['accessories', 'ethnic', 'fast fashion', 'footwear', 'formal', 'luxury', 'streetwear', 'sustainable fashion', 'western'],
  'finance': ['banking', 'crypto', 'fintech apps', 'insurance', 'investment', 'personal finance', 'trading'],
  'fitness': ['gym', 'home workout', 'muscle building', 'nutrition', 'supplements', 'weight loss', 'yoga'],
  'food & beverage': ['beverages', 'cafes', 'cloud kitchen', 'healthy food', 'packaged foods', 'restaurants', 'street food'],
  'gaming': ['esports', 'mobile gaming', 'pc/console', 'streaming'],
  'gifting': ['budget gifts', 'corporate gifting', 'festive gifts', 'handmade gifts', 'luxury gifts', 'personalized gifts'],
  'luxury': ['designer brands', 'high-end lifestyle', 'jewelry', 'watches'],
  'personal branding': ['coaches', 'creators', 'freelancers', 'influencers', 'thought leaders'],
  'real estate': ['commercial', 'investment', 'luxury properties', 'rentals', 'residential'],
  'tech': ['ai tools', 'gadgets', 'hardware', 'mobile apps', 'reviews', 'software tools', 'web apps'],
  'travel': ['adventure', 'budget travel', 'hotels/resorts', 'local experiences', 'luxury travel', 'solo travel'],
};

const INDUSTRIES = Object.keys(INDUSTRY_MAP);

const EMPTY_FORM = {
  title: '', link: '', hook: '', whyLiked: '', whyWorks: '',
  tags: { hookType: '', format: '', industry: '', subIndustry: '' }, rating: 0,
};

const AddIdeaPage = ({ editIdea = null, onEditDone }) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState(editIdea ? {
    title: editIdea.title || '',
    link: editIdea.link || '',
    hook: editIdea.hook || '',
    whyLiked: editIdea.whyLiked || '',
    whyWorks: editIdea.whyWorks || '',
    tags: editIdea.tags || { hookType: '', format: '', industry: '', subIndustry: '' },
    rating: editIdea.rating || 0,
  } : EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTag = (type, value) =>
    setForm(prev => ({
      ...prev,
      tags: { ...prev.tags, [type]: prev.tags[type] === value ? '' : value },
    }));

  const handleIndustry = (industry) => {
    setForm(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        industry: prev.tags.industry === industry ? '' : industry,
        // Clear sub-industry when changing/deselecting industry
        subIndustry: prev.tags.industry === industry ? '' : prev.tags.subIndustry,
      },
    }));
  };

  const handleSubIndustry = (sub) => {
    setForm(prev => ({
      ...prev,
      tags: { ...prev.tags, subIndustry: prev.tags.subIndustry === sub ? '' : sub },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editIdea) {
        await updateIdea(editIdea.id, form);
        toast.success('Idea updated! ✨');
        onEditDone?.();
      } else {
        await addIdea(form, currentUser.uid);
        toast.success('Idea saved! 🎉');
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      toast.error('Failed to save idea. Check your Firebase config.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const subIndustries = form.tags.industry ? (INDUSTRY_MAP[form.tags.industry] || []) : [];

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

        {/* Industry */}
        <div className="form-group">
          <label className="form-label">🏭 Industry</label>
          <div className="chip-selector">
            {INDUSTRIES.map(i => (
              <button key={i} type="button"
                className={`chip-option ${form.tags.industry === i ? 'selected-pink' : ''}`}
                onClick={() => handleIndustry(i)}>{i}</button>
            ))}
          </div>
        </div>

        {/* Sub-Industry — only shown when industry is selected */}
        {form.tags.industry && subIndustries.length > 0 && (
          <div className="form-group sub-industry-group">
            <label className="form-label">📌 Sub-Industry — {form.tags.industry}</label>
            <div className="chip-selector">
              {subIndustries.map(s => (
                <button key={s} type="button"
                  className={`chip-option ${form.tags.subIndustry === s ? 'selected-orange' : ''}`}
                  onClick={() => handleSubIndustry(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="form-group">
          <label className="form-label">⭐ Rating</label>
          <StarRating value={form.rating} onChange={r => handleChange('rating', r)} size="lg" />
        </div>

        <button type="submit" disabled={saving} className="brutal-btn btn-save-idea" id="save-idea-btn">
          <FiSave /> {saving ? 'Saving…' : editIdea ? 'Update Idea' : 'Save Idea'}
        </button>
      </form>
    </div>
  );
};

export default AddIdeaPage;
