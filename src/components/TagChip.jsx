const TAG_COLORS = {
  hook: 'chip-purple',
  format: 'chip-blue',
  industry: 'chip-pink',
  default: 'chip-gray',
};

const TagChip = ({ label, type = 'default', onRemove }) => {
  const colorClass = TAG_COLORS[type] || TAG_COLORS.default;
  return (
    <span className={`tag-chip ${colorClass}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="chip-remove" aria-label="Remove tag">
          ×
        </button>
      )}
    </span>
  );
};

export default TagChip;
