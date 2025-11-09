'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  language?: 'javascript' | 'python';
  onLanguageChange?: (lang: 'javascript' | 'python') => void;
}

type Theme = 'dark' | 'light';
type Language = 'javascript' | 'python';

/**
 * VS Code-like code editor with syntax highlighting and theme switching
 */
export function CodeEditor({
  initialCode,
  onChange,
  onRun,
  onSubmit,
  isLoading = false,
  language = 'javascript',
  onLanguageChange,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('editor-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('editor-theme', newTheme);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange(newCode);
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  // Handle paste to strip HTML and keep only plain text
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert at cursor position
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const newCode = code.substring(0, start) + text + code.substring(end);
    
    setCode(newCode);
    onChange(newCode);
    
    // Set cursor position after pasted text
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + text.length;
    }, 0);
  };

  // Sync scroll between textarea and highlight layer
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      onChange(newCode);
      
      // Set cursor position after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Theme colors
  const themes = {
    dark: {
      bg: 'bg-[#1e1e1e]',
      text: 'text-[#d4d4d4]',
      headerBg: 'bg-[#252526]',
      headerText: 'text-[#cccccc]',
      border: 'border-[#3e3e42]',
      tabBg: 'bg-[#2d2d30]',
      tabText: 'text-[#ffffff]',
      footerBg: 'bg-[#007acc]',
      footerText: 'text-white',
      lineNumber: 'text-[#858585]',
    },
    light: {
      bg: 'bg-white',
      text: 'text-[#000000]',
      headerBg: 'bg-[#f3f3f3]',
      headerText: 'text-[#383838]',
      border: 'border-[#e5e5e5]',
      tabBg: 'bg-[#ececec]',
      tabText: 'text-[#333333]',
      footerBg: 'bg-[#007acc]',
      footerText: 'text-white',
      lineNumber: 'text-[#237893]',
    },
  };

  const currentTheme = themes[theme];

  // Calculate line numbers
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  // Syntax highlighting function
  const highlightSyntax = (code: string, lang: Language): string => {
    if (lang === 'javascript') {
      return code
        // Comments
        .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="token-comment">$1</span>')
        // Strings
        .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, '<span class="token-string">$1</span>')
        // Keywords
        .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|throw|new|this|super|extends|static|get|set|typeof|instanceof|in|of|break|continue|switch|case|default|do|void|delete|yield)\b/g, '<span class="token-keyword">$1</span>')
        // Numbers
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>')
        // Functions
        .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="token-function">$1</span>')
        // Boolean/null
        .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="token-boolean">$1</span>');
    } else if (lang === 'python') {
      return code
        // Comments
        .replace(/(#.*$)/gm, '<span class="token-comment">$1</span>')
        // Strings (including multiline)
        .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '<span class="token-string">$1</span>')
        // Keywords
        .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|pass|break|continue|yield|lambda|async|await|and|or|not|in|is|None|True|False|global|nonlocal|del|assert)\b/g, '<span class="token-keyword">$1</span>')
        // Decorators
        .replace(/(@[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="token-decorator">$1</span>')
        // Numbers
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>')
        // Functions
        .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="token-function">$1</span>')
        // Self
        .replace(/\bself\b/g, '<span class="token-keyword">self</span>');
    }
    return code;
  };

  const highlightedCode = highlightSyntax(code, currentLanguage);

  // File extension based on language
  const fileExtension = currentLanguage === 'javascript' ? 'js' : 'py';
  const fileName = `solution.${fileExtension}`;

  return (
    <div className={`h-full flex flex-col ${currentTheme.bg} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* VS Code Title Bar */}
      <div className={`${currentTheme.headerBg} ${currentTheme.border} border-b px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className={`text-sm ${currentTheme.headerText}`}>solution.js</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition ${currentTheme.headerText}`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 transition ${currentTheme.headerText}`}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className={`${currentTheme.headerBg} ${currentTheme.border} border-b flex items-center justify-between`}>
        <div className={`${currentTheme.tabBg} ${currentTheme.tabText} inline-flex items-center gap-2 px-4 py-2 text-sm border-t-2 border-[#007acc]`}>
          {currentLanguage === 'javascript' ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3m4.73 15.04L11 16.45V7.55L7.73 6.03l-2.46 1.5v8.94l2.46 1.57M18.5 13.5L16 12v-2l2.5-1.5V18H18.5v-4.5z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#3776ab">
              <path d="M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.24l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05 1.07.13zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z"/>
            </svg>
          )}
          {fileName}
          <span className="text-xs opacity-50">●</span>
        </div>
        
        {/* Language Selector */}
        {onLanguageChange && (
          <div className="flex items-center gap-1 px-3">
            <button
              onClick={() => handleLanguageChange('javascript')}
              className={`px-2 py-1 rounded text-xs transition ${
                currentLanguage === 'javascript'
                  ? `${currentTheme.tabBg} ${currentTheme.tabText} font-semibold`
                  : `${currentTheme.headerText} opacity-60 hover:opacity-100`
              }`}
            >
              JavaScript
            </button>
            <span className={`${currentTheme.headerText} opacity-30`}>|</span>
            <button
              onClick={() => handleLanguageChange('python')}
              className={`px-2 py-1 rounded text-xs transition ${
                currentLanguage === 'python'
                  ? `${currentTheme.tabBg} ${currentTheme.tabText} font-semibold`
                  : `${currentTheme.headerText} opacity-60 hover:opacity-100`
              }`}
            >
              Python
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div className={`${currentTheme.bg} ${currentTheme.lineNumber} select-none py-4 px-3 text-right font-mono text-sm border-r ${currentTheme.border} overflow-hidden`}>
          {lineNumbers.map((num) => (
            <div key={num} style={{ lineHeight: '1.6' }}>
              {num}
            </div>
          ))}
        </div>

        {/* Container for syntax highlighting and textarea */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Background */}
          <pre
            ref={highlightRef}
            className={`absolute inset-0 p-4 ${currentTheme.bg} font-mono text-sm overflow-auto pointer-events-none syntax-highlight-${theme}`}
            style={{
              fontFamily: "'Consolas', 'Courier New', monospace",
              lineHeight: '1.6',
              tabSize: 2,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              margin: 0,
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* Code Textarea (Transparent overlay) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onPaste={handlePaste}
            disabled={isLoading}
            spellCheck="false"
            className={`absolute inset-0 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none border-none`}
            placeholder={currentLanguage === 'javascript' ? '// Write your solution here...' : '# Write your solution here...'}
            style={{
              fontFamily: "'Consolas', 'Courier New', monospace",
              lineHeight: '1.6',
              tabSize: 2,
              color: 'transparent',
              caretColor: theme === 'dark' ? '#ffffff' : '#000000',
            }}
          />
        </div>
      </div>

      {/* Syntax Highlighting Styles */}
      <style jsx>{`
        pre {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
        
        .syntax-highlight-dark .token-comment { color: #6A9955; }
        .syntax-highlight-dark .token-string { color: #CE9178; }
        .syntax-highlight-dark .token-keyword { color: #569CD6; }
        .syntax-highlight-dark .token-function { color: #DCDCAA; }
        .syntax-highlight-dark .token-number { color: #B5CEA8; }
        .syntax-highlight-dark .token-boolean { color: #569CD6; }
        .syntax-highlight-dark .token-decorator { color: #4EC9B0; }

        .syntax-highlight-light .token-comment { color: #008000; }
        .syntax-highlight-light .token-string { color: #A31515; }
        .syntax-highlight-light .token-keyword { color: #0000FF; }
        .syntax-highlight-light .token-function { color: #795E26; }
        .syntax-highlight-light .token-number { color: #098658; }
        .syntax-highlight-light .token-boolean { color: #0000FF; }
        .syntax-highlight-light .token-decorator { color: #267F99; }
      `}</style>

      {/* Status Bar */}
      <div className={`${currentTheme.footerBg} ${currentTheme.footerText} px-4 py-1 text-xs flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z"/>
              <path d="M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/>
            </svg>
            Ln {code.substring(0, code.lastIndexOf('\n', code.length - 1) + 1).split('\n').length}, Col {code.length - code.lastIndexOf('\n')}
          </span>
          <span>{currentLanguage === 'javascript' ? 'JavaScript' : 'Python'}</span>
          <span>UTF-8</span>
          <span>CRLF</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{code.split('\n').length} lines</span>
          <span>{code.length} chars</span>
        </div>
      </div>
    </div>
  );
}
