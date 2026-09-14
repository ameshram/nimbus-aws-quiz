import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Exam } from '../types/questionBank';
import { EXAMS } from '../config/exams';
import { useAuth } from '../contexts/AuthContext';
import { AboutModal } from './AboutModal';
import { UserAuthModal } from './UserAuthModal';

interface LayoutProps {
  children: ReactNode;
  currentExam: Exam;
  onExamChange?: (exam: Exam) => void;
}

export function Layout({ children, currentExam, onExamChange }: LayoutProps) {
  const hasMultipleExams = EXAMS.length > 1;
  const { isAdmin, logout, user, isAuthenticated, logoutUser } = useAuth();
  const [showAbout, setShowAbout] = useState(false);
  const [showUserAuth, setShowUserAuth] = useState(false);

  return (
    <div className="min-h-screen bg-nimbus-bg flex flex-col">
      {/* Header - Light & Minimal */}
      <header className="bg-white border-b border-nimbus-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <CloudIcon className="w-7 h-7 text-aws-orange" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-nimbus-text leading-tight">Nimbus</span>
                <span className="text-[10px] text-nimbus-muted leading-tight hidden sm:block">AWS Quiz & Flashcard Engine</span>
              </div>
            </a>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* User Auth Section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {user?.username}
                  </span>
                  <button
                    onClick={logoutUser}
                    className="text-sm text-nimbus-muted hover:text-nimbus-text transition-colors"
                    title="Sign out"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowUserAuth(true)}
                  className="px-3 py-1.5 text-sm text-nimbus-muted hover:text-nimbus-text hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign in
                </button>
              )}

              {/* Admin Badge & Logout */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Admin
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-nimbus-muted hover:text-nimbus-text transition-colors"
                    title="Admin Logout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Exam Selector */}
              {onExamChange && (
                <ExamDropdown
                  currentExam={currentExam}
                  exams={EXAMS}
                  onExamChange={onExamChange}
                  showSelector={hasMultipleExams}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 mt-auto border-t border-nimbus-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-nimbus-muted">
            <p>
              &copy; {new Date().getFullYear()} Bodhi-x. Nimbus is an AWS Quiz & Flashcard Engine.
            </p>
            <button
              onClick={() => setShowAbout(true)}
              className="hover:text-nimbus-text transition-colors"
            >
              About Bodhi-x
            </button>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* User Auth Modal */}
      {showUserAuth && <UserAuthModal onClose={() => setShowUserAuth(false)} />}
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
    </svg>
  );
}

interface ExamDropdownProps {
  currentExam: Exam;
  exams: Exam[];
  onExamChange: (exam: Exam) => void;
  showSelector: boolean;
}

function ExamDropdown({ currentExam, exams, onExamChange, showSelector }: ExamDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showSelector) {
    // Just show the exam badge without dropdown
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-nimbus-border">
        <span className="text-sm font-medium text-nimbus-text">{currentExam.code}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-nimbus-border transition-colors"
      >
        <span className="text-sm font-medium text-nimbus-text">{currentExam.code}</span>
        <svg
          className={`w-4 h-4 text-nimbus-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-nimbus-border overflow-hidden z-50">
          <div className="p-2">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => {
                  onExamChange(exam);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  exam.id === currentExam.id
                    ? 'bg-aws-orange/10 border border-aws-orange/20'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{exam.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-nimbus-text">{exam.code}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-nimbus-muted capitalize">
                        {exam.category}
                      </span>
                    </div>
                    <p className="text-sm text-nimbus-muted mt-0.5 truncate">{exam.shortName}</p>
                  </div>
                  {exam.id === currentExam.id && (
                    <svg className="w-5 h-5 text-aws-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
