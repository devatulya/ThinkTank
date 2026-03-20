import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const HOOK_TYPES = ['emotional', 'funny', 'shocking', 'relatable', 'inspiring', 'educational'];
const FORMATS = ['reel', 'carousel', 'storytelling', 'meme', 'ugc', 'tutorial'];
const INDUSTRIES = ['fashion', 'gifting', 'fintech', 'food', 'beauty', 'tech', 'fitness', 'travel'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'most-bookmarked', label: 'Most Bookmarked' },
];

const SearchFilterBar = ({ onSearch, onFilter, onSort, initialFilters = {} }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(initialFilters.minRating || 0);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedHooks, setSelectedHooks] = useState([]);
  const [sort, setSort] = useState('newest');

  const handleSearch = (value) => {
    setSearch(value);
    onSearch?.(value);
  };

  const toggleItem = (arr, setArr, item) => {
    const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
    setArr(next);
    applyFilters({ formats: selectedFormats, industries: selectedIndustries, hooks: selectedHooks, [getKey(arr)]: next });
  };

  const getKey = (arr) => arr === selectedFormats ? 'formats' : arr === selectedIndustries ? 'industries' : 'hooks';

  const applyFilters = (current = {}) => {
    onFilter?.({
      minRating,
      formats: selectedFormats,
      industries: selectedIndustries,
      hooks: selectedHooks,
      ...current,
    });
  };

  const handleRating = (val) => {
    setMinRating(val);
    onFilter?.({ minRating: val, formats: selectedFormats, industries: selectedIndustries, hooks: selectedHooks });
  };

  const handleSort = (val) => {
    setSort(val);
    onSort?.(val);
  };

  const clearFilters = () => {
    setMinRating(0);
    setSelectedFormats([]);
    setSelectedIndustries([]);
    setSelectedHooks([]);
    onFilter?.({ minRating: 0, formats: [], industries: [], hooks: [] });
  };

  return (
    <div className="search-filter-bar">
      <div className="search-row">
        <div className="search-input-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by title, hook, or tags..."
            className="search-input"
            id="search-bar"
          />
        </div>
        <select value={sort} onChange={e => handleSort(e.target.value)} className="sort-select">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
        >
          <FiFilter /> Filters {(selectedFormats.length + selectedIndustries.length + selectedHooks.length + (minRating > 0 ? 1 : 0)) > 0 && `(${selectedFormats.length + selectedIndustries.length + selectedHooks.length + (minRating > 0 ? 1 : 0)})`}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Min Rating</label>
            <div className="rating-filter-btns">
              {[0, 1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => handleRating(r)}
                  className={`rating-filter-btn ${minRating === r ? 'active' : ''}`}
                >
                  {r === 0 ? 'All' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Hook Type</label>
            <div className="chip-group">
              {HOOK_TYPES.map(h => (
                <button
                  key={h}
                  onClick={() => toggleItem(selectedHooks, setSelectedHooks, h)}
                  className={`filter-chip ${selectedHooks.includes(h) ? 'filter-chip-active-purple' : ''}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Format</label>
            <div className="chip-group">
              {FORMATS.map(f => (
                <button
                  key={f}
                  onClick={() => toggleItem(selectedFormats, setSelectedFormats, f)}
                  className={`filter-chip ${selectedFormats.includes(f) ? 'filter-chip-active-blue' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <div className="chip-group">
              {INDUSTRIES.map(i => (
                <button
                  key={i}
                  onClick={() => toggleItem(selectedIndustries, setSelectedIndustries, i)}
                  className={`filter-chip ${selectedIndustries.includes(i) ? 'filter-chip-active-pink' : ''}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <button onClick={clearFilters} className="clear-filters-btn">Clear All Filters</button>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
