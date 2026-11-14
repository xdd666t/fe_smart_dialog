import { useMemo } from 'react';
import { cn } from '../lib/utils';
import { tokenizeCode, type CodeLanguage } from '../utils/highlight';

interface CodeBlockProps {
  code: string;
  lang?: CodeLanguage;
  isDark: boolean;
  codeTestId?: string;
  scrollTestId?: string;
  className?: string;
  compact?: boolean;
}

export function CodeBlock({
  code,
  lang = 'typescript',
  isDark,
  codeTestId,
  scrollTestId,
  className,
  compact = false,
}: CodeBlockProps) {
  const lines = useMemo(
    () => tokenizeCode(code, lang, isDark),
    [code, lang, isDark],
  );

  return (
    <div
      className={cn(
        'pg-code-scroll flex-1 min-h-0 bg-[var(--pg-code-bg)]',
        className,
      )}
      data-testid={scrollTestId}
    >
      <pre
        className={cn(
          'pg-code-pre',
          compact && 'py-2.5 text-[11.5px] leading-relaxed',
        )}
      >
        <code data-testid={codeTestId}>
          {lines.map((lineTokens, lineIndex) => (
            <div
              key={lineIndex}
              className={cn('pg-code-line', compact && 'px-3 gap-2.5')}
            >
              <span className="pg-code-ln">{lineIndex + 1}</span>
              <span className="whitespace-pre">
                {lineTokens.length === 0
                  ? '\u00A0'
                  : lineTokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        style={
                          token.color ? { color: token.color } : undefined
                        }
                      >
                        {token.content}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
