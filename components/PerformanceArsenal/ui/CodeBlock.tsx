// components/PerformanceArsenal/ui/CodeBlock.tsx
import React from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy?: () => void;
}

export function CodeBlock({ code, language, onCopy }: CodeBlockProps) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        {onCopy && (
          <button onClick={onCopy} className="copy-button">
            📋 Copy
          </button>
        )}
      </div>
      <pre className="code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}
