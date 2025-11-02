'use client';

import { useState } from 'react';

interface CodeEditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

/**
 * Code editor component with syntax highlighting
 * Allows users to write and edit their solution
 */
export function CodeEditor({
  initialCode,
  onChange,
  onRun,
  onSubmit,
  isLoading = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange(newCode);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-50">
      {/* Editor Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-300">Solution</div>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Code Input */}
      <textarea
        value={code}
        onChange={handleChange}
        disabled={isLoading}
        spellCheck="false"
        className="flex-1 p-4 bg-slate-900 text-slate-50 font-mono text-sm resize-none focus:outline-none border-none"
        placeholder="Write your solution here..."
        style={{
          fontFamily: "'Fira Code', 'Courier New', monospace",
          lineHeight: '1.6',
        }}
      />

      {/* Stats */}
      <div className="border-t border-slate-700 px-4 py-2 text-xs text-slate-400 flex justify-between">
        <span>Characters: {code.length}</span>
        <span>Lines: {code.split('\n').length}</span>
      </div>
    </div>
  );
}
