import { useState } from 'react';
import type { FlashcardFilterState, FlashcardCategoryOption } from '../types/flashcard';

interface FlashcardViewProps {
  filters: FlashcardFilterState;
  onFilterChange: (filters: FlashcardFilterState) => void;
  categoryOptions: FlashcardCategoryOption[];
  difficultyOptions: FlashcardCategoryOption[];
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
  onStartStudy: (limit?: number) => void;
}

const CARD_PRESETS = [10, 25, 50] as const;

export function FlashcardView({
  filters,
  onFilterChange,
  categoryOptions,
  filteredCount,
  totalCount,
  onResetFilters,
  onStartStudy,
}: FlashcardViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | 'all'>('all');

  const handleStartStudy = () => {
    const limit = selectedPreset === 'all' ? undefined : selectedPreset;
    onStartStudy(limit);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];

    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.difficulties.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <section className="bg-white rounded-2xl border border-nimbus-border shadow-soft p-8 md:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600 mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Flashcard Mode
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-nimbus-text mb-3">
              AWS Flashcards
            </h1>
            <p className="text-nimbus-muted">
              Review key concepts with interactive flashcards
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-aws-orange">{totalCount}</div>
              <div className="text-sm text-nimbus-muted">Total Cards</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{categoryOptions.length}</div>
              <div className="text-sm text-nimbus-muted">Categories</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{filteredCount}</div>
              <div className="text-sm text-nimbus-muted">Selected</div>
            </div>
          </div>

          {/* Session Config */}
          <div className="flex flex-col items-center gap-6">
            {/* Preset Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-nimbus-muted mr-2">Cards:</span>
              {CARD_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  disabled={filteredCount < preset}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedPreset === preset
                      ? 'bg-aws-orange text-white'
                      : filteredCount < preset
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-nimbus-text hover:bg-gray-200'
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
              <button
                onClick={() => setSelectedPreset('all')}
                disabled={filteredCount === 0}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedPreset === 'all'
                    ? 'bg-aws-orange text-white'
                    : filteredCount === 0
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 text-nimbus-text hover:bg-gray-200'
                  }
                `}
              >
                All
              </button>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartStudy}
              disabled={filteredCount === 0}
              className={`
                px-8 py-3 rounded-xl font-medium text-base transition-all
                ${filteredCount > 0
                  ? 'bg-aws-orange text-white hover:bg-aws-orange-dark shadow-soft-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Start Study Session
            </button>

            {/* Filter indicator */}
            {hasActiveFilters && (
              <p className="text-sm text-nimbus-muted">
                Studying with filtered cards
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter Panel */}
      <section className="bg-white rounded-xl border border-nimbus-border shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-nimbus-text">Filter by Category</h3>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-sm text-aws-orange hover:text-aws-orange-dark"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryOptions.map((category) => {
            const isSelected = filters.categories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all text-left
                  ${isSelected
                    ? 'border-aws-orange bg-aws-orange/5 text-aws-orange'
                    : 'border-nimbus-border hover:border-gray-300 text-nimbus-text'
                  }
                `}
              >
                <span className="font-medium text-sm truncate">{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-aws-orange/20' : 'bg-gray-100'
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Empty State */}
      {filteredCount === 0 && (
        <div className="bg-white rounded-xl border border-nimbus-border p-8 text-center">
          <p className="text-nimbus-text font-medium mb-2">No flashcards match your filters</p>
          <p className="text-nimbus-muted text-sm mb-4">
            Try selecting different categories
          </p>
          <button
            onClick={onResetFilters}
            className="text-sm font-medium text-aws-orange hover:text-aws-orange-dark"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
