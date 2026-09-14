import { useState } from 'react';
import type { FilterState, FilterOption } from '../types/questionBank';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  domainOptions: FilterOption[];
  topicOptions: FilterOption[];
  subtopicOptions: FilterOption[];
  difficultyOptions: FilterOption[];
  onReset: () => void;
}

export function FilterPanel({
  filters,
  onFilterChange,
  domainOptions,
  topicOptions,
  subtopicOptions,
  difficultyOptions,
  onReset,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.domains.length > 0 ||
    filters.topics.length > 0 ||
    filters.subtopics.length > 0 ||
    filters.difficulties.length > 0;

  const activeFilterCount =
    filters.domains.length +
    filters.topics.length +
    filters.subtopics.length +
    filters.difficulties.length;

  const handleFilterChange = (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[category] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    const newFilters = { ...filters, [category]: newValues };

    if (category === 'domains') {
      newFilters.topics = [];
      newFilters.subtopics = [];
    } else if (category === 'topics') {
      newFilters.subtopics = [];
    }

    onFilterChange(newFilters);
  };

  const removeFilter = (category: keyof FilterState, value: string) => {
    handleFilterChange(category, value, false);
  };

  const getFilterName = (category: keyof FilterState, id: string): string => {
    const optionsMap: Record<keyof FilterState, FilterOption[]> = {
      domains: domainOptions,
      topics: topicOptions,
      subtopics: subtopicOptions,
      difficulties: difficultyOptions,
    };
    const option = optionsMap[category].find((o) => o.id === id);
    return option?.name || id;
  };

  return (
    <section className="bg-white rounded-xl border border-nimbus-border shadow-soft overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-nimbus-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium text-nimbus-text">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-aws-orange/10 text-aws-orange text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        <svg
          className={`w-5 h-5 text-nimbus-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Active Filter Chips - Show when collapsed with filters */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {filters.domains.map((id) => (
            <FilterChip
              key={`domain-${id}`}
              label={getFilterName('domains', id)}
              onRemove={() => removeFilter('domains', id)}
            />
          ))}
          {filters.topics.map((id) => (
            <FilterChip
              key={`topic-${id}`}
              label={getFilterName('topics', id)}
              onRemove={() => removeFilter('topics', id)}
            />
          ))}
          {filters.subtopics.map((id) => (
            <FilterChip
              key={`subtopic-${id}`}
              label={getFilterName('subtopics', id)}
              onRemove={() => removeFilter('subtopics', id)}
            />
          ))}
          {filters.difficulties.map((id) => (
            <FilterChip
              key={`difficulty-${id}`}
              label={getFilterName('difficulties', id)}
              onRemove={() => removeFilter('difficulties', id)}
            />
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-sm text-nimbus-muted hover:text-nimbus-text"
          >
            Clear
          </button>
        </div>
      )}

      {/* Expanded Filter Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-nimbus-border">
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="py-4 flex flex-wrap items-center gap-2 border-b border-nimbus-border">
              <span className="text-sm text-nimbus-muted mr-1">Active:</span>
              {filters.domains.map((id) => (
                <FilterChip
                  key={`domain-${id}`}
                  label={getFilterName('domains', id)}
                  onRemove={() => removeFilter('domains', id)}
                />
              ))}
              {filters.topics.map((id) => (
                <FilterChip
                  key={`topic-${id}`}
                  label={getFilterName('topics', id)}
                  onRemove={() => removeFilter('topics', id)}
                />
              ))}
              {filters.subtopics.map((id) => (
                <FilterChip
                  key={`subtopic-${id}`}
                  label={getFilterName('subtopics', id)}
                  onRemove={() => removeFilter('subtopics', id)}
                />
              ))}
              {filters.difficulties.map((id) => (
                <FilterChip
                  key={`difficulty-${id}`}
                  label={getFilterName('difficulties', id)}
                  onRemove={() => removeFilter('difficulties', id)}
                />
              ))}
              <button
                onClick={onReset}
                className="text-sm text-aws-orange hover:text-aws-orange-dark font-medium ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter Grid */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FilterGroup
              title="Domain"
              options={domainOptions}
              selectedValues={filters.domains}
              onChange={(value, checked) => handleFilterChange('domains', value, checked)}
            />

            <FilterGroup
              title="Topic"
              options={topicOptions}
              selectedValues={filters.topics}
              onChange={(value, checked) => handleFilterChange('topics', value, checked)}
              disabled={topicOptions.length === 0}
              emptyMessage="Select a domain first"
            />

            <fieldset>
              <legend className="text-sm font-medium text-nimbus-text mb-3">Difficulty</legend>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => (
                  <DifficultyPill
                    key={option.id}
                    option={option}
                    selected={filters.difficulties.includes(option.id as 'easy' | 'medium' | 'hard')}
                    onChange={(checked) => handleFilterChange('difficulties', option.id, checked)}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          {/* Advanced Filters */}
          {subtopicOptions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-nimbus-border">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-nimbus-muted hover:text-nimbus-text flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showAdvanced ? 'Hide' : 'More'} filters
              </button>

              {showAdvanced && (
                <div className="mt-4">
                  <FilterGroup
                    title="Subtopic"
                    options={subtopicOptions}
                    selectedValues={filters.subtopics}
                    onChange={(value, checked) => handleFilterChange('subtopics', value, checked)}
                    columns={2}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-nimbus-text rounded-full text-sm">
      {label}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 hover:text-nimbus-muted"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  emptyMessage?: string;
  columns?: 1 | 2;
}

function FilterGroup({
  title,
  options,
  selectedValues,
  onChange,
  disabled = false,
  emptyMessage = 'No options available',
  columns = 1,
}: FilterGroupProps) {
  return (
    <fieldset className={disabled ? 'opacity-50' : ''}>
      <legend className="text-sm font-medium text-nimbus-text mb-3">{title}</legend>

      {options.length === 0 ? (
        <p className="text-sm text-nimbus-muted italic">{emptyMessage}</p>
      ) : (
        <div className={`max-h-48 overflow-y-auto space-y-1 ${columns === 2 ? 'grid grid-cols-2 gap-x-4 gap-y-1 space-y-0' : ''}`}>
          {options.map((option) => (
            <label
              key={option.id}
              className={`
                flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                ${selectedValues.includes(option.id) ? 'bg-aws-orange/5' : 'hover:bg-gray-50'}
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={(e) => onChange(option.id, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 rounded border-gray-300 text-aws-orange focus:ring-aws-orange focus:ring-offset-0"
              />
              <span className="flex-1 text-sm text-nimbus-text truncate" title={option.name}>
                {option.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

interface DifficultyPillProps {
  option: FilterOption;
  selected: boolean;
  onChange: (checked: boolean) => void;
}

function DifficultyPill({ option, selected, onChange }: DifficultyPillProps) {
  const difficultyStyles: Record<string, { base: string; selected: string }> = {
    easy: { base: 'bg-green-50 text-green-700', selected: 'bg-green-500 text-white' },
    medium: { base: 'bg-amber-50 text-amber-700', selected: 'bg-amber-500 text-white' },
    hard: { base: 'bg-red-50 text-red-700', selected: 'bg-red-500 text-white' },
  };

  const styles = difficultyStyles[option.id] || { base: 'bg-gray-100 text-gray-700', selected: 'bg-gray-500 text-white' };

  return (
    <label
      className={`
        inline-flex items-center px-3 py-1.5 rounded-lg cursor-pointer
        text-sm font-medium capitalize transition-all
        ${selected ? styles.selected : styles.base}
      `}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {option.name}
    </label>
  );
}
