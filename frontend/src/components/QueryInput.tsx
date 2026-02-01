import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { QUERY_TEMPLATES } from '../types';

interface QueryInputProps {
  onQuery: (query: string) => void;
  loading: boolean;
}

export function QueryInput({ onQuery, loading }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onQuery(query.trim());
    }
  }, [query, loading, onQuery]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !loading) {
        onQuery(query.trim());
      }
    }
  }, [query, loading, onQuery]);

  const selectTemplate = useCallback((templateQuery: string) => {
    setQuery(templateQuery);
    setShowTemplates(false);
    onQuery(templateQuery);
  }, [onQuery]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg">
        <div className="flex items-start p-2 gap-2">
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowTemplates(true)}
              onBlur={() => setTimeout(() => setShowTemplates(false), 200)}
              placeholder="Ask about your codebase... e.g., 'Show me the API routes'"
              className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing
              </span>
            ) : (
              'Query'
            )}
          </button>
        </div>

        {/* Query templates dropdown */}
        {showTemplates && !loading && (
          <div className="border-t border-gray-100 p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">Quick queries:</div>
            <div className="flex flex-wrap gap-2">
              {QUERY_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => selectTemplate(template.query)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  title={template.description}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
