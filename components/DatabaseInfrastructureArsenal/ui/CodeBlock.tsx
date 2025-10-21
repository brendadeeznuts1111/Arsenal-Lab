// components/DatabaseInfrastructureArsenal/ui/CodeBlock.tsx

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  onCopy?: () => void;
}

export function CodeBlock({ code, language = 'typescript', title, onCopy }: CodeBlockProps) {
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div className="code-section">
      {title && (
        <div className="code-header">
          <h4 className="code-title">{title}</h4>
        </div>
      )}
      <div className="code-container">
        <pre className={`code-block language-${language}`}>
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="copy-button"
          title="Copy to clipboard"
        >
          <span className="copy-icon">📋</span>
          Copy
        </button>
      </div>
    </div>
  );
}
