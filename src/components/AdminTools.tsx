import { useState } from 'react';

interface AdminToolsProps {
  onClose: () => void;
  onComplete?: () => void;
}

type Mode = 'select' | 'running' | 'complete';

interface RunResult {
  success: boolean;
  totalGenerated?: number;
  totalValidated?: number;
  totalCorrected?: number;
  totalRemoved?: number;
  subtopicsProcessed?: number;
  categoriesProcessed?: number;
  error?: string;
}

export function AdminTools({ onClose, onComplete }: AdminToolsProps) {
  const [mode, setMode] = useState<Mode>('select');
  const [action, setAction] = useState<'generate' | 'validate' | 'generate-flashcards' | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAutoGenerate = async () => {
    setAction('generate');
    setMode('running');
    setError(null);

    try {
      const response = await fetch('/api/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionsPerSubtopic: 2, difficulty: 'medium' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Auto-generate failed');
      }

      setResult(data);
      setMode('complete');
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-generate failed');
      setMode('select');
    }
  };

  const handleAutoValidate = async () => {
    setAction('validate');
    setMode('running');
    setError(null);

    try {
      const response = await fetch('/api/auto-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 5 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Auto-validate failed');
      }

      setResult(data);
      setMode('complete');
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-validate failed');
      setMode('select');
    }
  };

  const handleAutoGenerateFlashcards = async () => {
    setAction('generate-flashcards');
    setMode('running');
    setError(null);

    try {
      const response = await fetch('/api/auto-generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardsPerCategory: 5 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Auto-generate flashcards failed');
      }

      setResult(data);
      setMode('complete');
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-generate flashcards failed');
      setMode('select');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-nimbus-text">Admin Tools</h2>
              <p className="text-sm text-nimbus-muted mt-1">
                One-click question management
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={mode === 'running'}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'select' && (
            <div className="space-y-4">
              {/* Auto Generate Card */}
              <button
                onClick={handleAutoGenerate}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-left hover:from-purple-100 hover:to-purple-150 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-nimbus-text">Auto Generate</h3>
                    <p className="text-sm text-nimbus-muted mt-1">
                      Generate 2 new questions for every subtopic automatically
                    </p>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      Click to start generation across all topics
                    </p>
                  </div>
                </div>
              </button>

              {/* Auto Validate Card */}
              <button
                onClick={handleAutoValidate}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-left hover:from-blue-100 hover:to-blue-150 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-nimbus-text">Auto Validate</h3>
                    <p className="text-sm text-nimbus-muted mt-1">
                      Validate all unvalidated questions against AWS docs
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Click to validate all questions automatically
                    </p>
                  </div>
                </div>
              </button>

              {/* Auto Generate Flashcards Card */}
              <button
                onClick={handleAutoGenerateFlashcards}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl text-left hover:from-green-100 hover:to-green-150 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-nimbus-text">Auto Generate Flashcards</h3>
                    <p className="text-sm text-nimbus-muted mt-1">
                      Generate 5 new flashcards for every category
                    </p>
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Click to generate flashcards across all categories
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === 'running' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className={`absolute inset-0 border-4 rounded-full animate-spin ${
                  action === 'generate' ? 'border-t-purple-600' :
                  action === 'validate' ? 'border-t-blue-600' :
                  'border-t-green-600'
                }`}></div>
              </div>
              <h3 className="text-lg font-semibold text-nimbus-text mb-2">
                {action === 'generate' ? 'Generating Questions...' :
                 action === 'validate' ? 'Validating Questions...' :
                 'Generating Flashcards...'}
              </h3>
              <p className="text-sm text-nimbus-muted">
                {action === 'generate'
                  ? 'Creating 2 questions for each subtopic. This may take a few minutes.'
                  : action === 'validate'
                  ? 'Checking all unvalidated questions. This may take a few minutes.'
                  : 'Creating 5 flashcards for each category. This may take a few minutes.'}
              </p>
              <p className="text-xs text-nimbus-muted mt-4">
                Please don't close this window
              </p>
            </div>
          )}

          {mode === 'complete' && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-nimbus-text mb-2">
                {action === 'generate' ? 'Generation Complete!' :
                 action === 'validate' ? 'Validation Complete!' :
                 'Flashcard Generation Complete!'}
              </h3>

              {action === 'generate' && (
                <div className="bg-purple-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{result.totalGenerated}</div>
                      <div className="text-xs text-nimbus-muted">Questions Generated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{result.subtopicsProcessed}</div>
                      <div className="text-xs text-nimbus-muted">Subtopics Processed</div>
                    </div>
                  </div>
                </div>
              )}

              {action === 'validate' && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{result.totalValidated}</div>
                      <div className="text-xs text-nimbus-muted">Valid</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{result.totalCorrected}</div>
                      <div className="text-xs text-nimbus-muted">Corrected</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{result.totalRemoved}</div>
                      <div className="text-xs text-nimbus-muted">Removed</div>
                    </div>
                  </div>
                </div>
              )}

              {action === 'generate-flashcards' && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{result.totalGenerated}</div>
                      <div className="text-xs text-nimbus-muted">Flashcards Generated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{result.categoriesProcessed}</div>
                      <div className="text-xs text-nimbus-muted">Categories Processed</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
