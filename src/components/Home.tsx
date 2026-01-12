import { useState } from 'react';
import type { FilterState, FilterOption, Exam } from '../types/questionBank';
import { FilterPanel } from './FilterPanel';
import { AdminTools } from './AdminTools';
import { LoginModal } from './LoginModal';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  exam: Exam;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  domainOptions: FilterOption[];
  topicOptions: FilterOption[];
  subtopicOptions: FilterOption[];
  difficultyOptions: FilterOption[];
  filteredCount: number;
  onResetFilters: () => void;
  onStartQuiz: (limit?: number) => void;
  onRefreshQuestions?: () => void;
}

const QUESTION_PRESETS = [10, 25, 50] as const;

export function Home({
  exam,
  filters,
  onFilterChange,
  domainOptions,
  topicOptions,
  subtopicOptions,
  difficultyOptions,
  filteredCount,
  onResetFilters,
  onStartQuiz,
  onRefreshQuestions,
}: HomeProps) {
  const { isAdmin } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<number | 'all'>('all');
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleStartQuiz = () => {
    const limit = selectedPreset === 'all' ? undefined : selectedPreset;
    onStartQuiz(limit);
  };

  const hasActiveFilters =
    filters.domains.length > 0 ||
    filters.topics.length > 0 ||
    filters.subtopics.length > 0 ||
    filters.difficulties.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero Card - Clean & Minimal */}
      <section className="bg-white rounded-2xl border border-nimbus-border shadow-soft p-8 md:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Exam Info */}
          <div className="text-center mb-8">
            <p className="text-sm text-nimbus-muted mb-2">
              Nimbus — AWS Quiz & Flashcard Engine
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-sm text-nimbus-muted mb-4">
              <span>{exam.code}</span>
              <span className="text-gray-300">·</span>
              <span className="capitalize">{exam.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-nimbus-text mb-3">
              {exam.name}
            </h1>
            <p className="text-nimbus-muted">
              {exam.description}
            </p>
          </div>

          {/* Session Config */}
          <div className="flex flex-col items-center gap-6">
            {/* Preset Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-nimbus-muted mr-2">Questions:</span>
              {QUESTION_PRESETS.map((preset) => (
                <PresetButton
                  key={preset}
                  value={preset}
                  selected={selectedPreset === preset}
                  disabled={filteredCount < preset}
                  onClick={() => setSelectedPreset(preset)}
                />
              ))}
              <PresetButton
                value="all"
                label="All"
                selected={selectedPreset === 'all'}
                disabled={filteredCount === 0}
                onClick={() => setSelectedPreset('all')}
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              disabled={filteredCount === 0}
              className={`
                px-8 py-3 rounded-xl font-medium text-base transition-all
                ${filteredCount > 0
                  ? 'bg-aws-orange text-white hover:bg-aws-orange-dark shadow-soft-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Start Practice
            </button>

            {/* Filter indicator */}
            {hasActiveFilters && (
              <p className="text-sm text-nimbus-muted">
                Practicing with filtered questions
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={onFilterChange}
        domainOptions={domainOptions}
        topicOptions={topicOptions}
        subtopicOptions={subtopicOptions}
        difficultyOptions={difficultyOptions}
        onReset={onResetFilters}
      />

      {/* Empty State */}
      {filteredCount === 0 && (
        <div className="bg-white rounded-xl border border-nimbus-border p-8 text-center">
          <p className="text-nimbus-text font-medium mb-2">No questions match your filters</p>
          <p className="text-nimbus-muted text-sm mb-4">
            Try adjusting your filter selection
          </p>
          <button
            onClick={onResetFilters}
            className="text-sm font-medium text-aws-orange hover:text-aws-orange-dark"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Admin Tools Section */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-nimbus-text mb-1">Question Bank Tools</h3>
            <p className="text-sm text-nimbus-muted">
              {isAdmin
                ? 'One-click auto-generate or auto-validate all questions'
                : 'Admin login required to manage questions'
              }
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => setShowAdminTools(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Tools
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin Login
            </button>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => setShowLogin(false)}
        />
      )}

      {/* Admin Tools Modal */}
      {showAdminTools && isAdmin && (
        <AdminTools
          onClose={() => setShowAdminTools(false)}
          onComplete={() => {
            if (onRefreshQuestions) {
              onRefreshQuestions();
            }
          }}
        />
      )}
    </div>
  );
}

interface PresetButtonProps {
  value: number | 'all';
  label?: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

function PresetButton({ value, label, selected, disabled, onClick }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${selected
          ? 'bg-aws-orange text-white'
          : disabled
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'bg-gray-100 text-nimbus-text hover:bg-gray-200'
        }
      `}
    >
      {label || value}
    </button>
  );
}
