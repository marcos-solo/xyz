import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GraduationCap, Users, BookOpen, FolderKanban, Award, ChevronRight } from 'lucide-react';
import api from '../../api/client';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    students: any[];
    staff: any[];
    courses: any[];
    batches: any[];
    certificates: any[];
  }>({
    students: [],
    staff: [],
    courses: [],
    batches: [],
    certificates: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ students: [], staff: [], courses: [], batches: [], certificates: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/search', { params: { q: query } });
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits =
    results.students.length +
    results.staff.length +
    results.courses.length +
    results.batches.length +
    results.certificates.length;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="h-5 w-5 text-[#73111b] mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, staff, courses, cohorts, certificates..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-white">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">Searching IAT system database...</div>
          )}

          {!loading && query.length >= 2 && totalHits === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 text-[#73111b]" /> Students
              </p>
              <div className="space-y-1 mt-1">
                {results.students.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.url)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#73111b] transition">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3 w-3 text-emerald-600" /> Courses
              </p>
              <div className="space-y-1 mt-1">
                {results.courses.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.url)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cohort Batches */}
          {results.batches.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban className="h-3 w-3 text-purple-600" /> Cohort Batches
              </p>
              <div className="space-y-1 mt-1">
                {results.batches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.url)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex justify-between">
          <span>Navigate with <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">↵</kbd> to view</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
