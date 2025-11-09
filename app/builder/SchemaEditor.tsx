/**
 * SchemaEditor Component
 *
 * Enhanced JSON schema editor with:
 * - Line numbers
 * - Tab indentation support
 * - Syntax highlighting for selected fields
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedField?: string | null;
  className?: string;
}

export default function SchemaEditor({
  value,
  onChange,
  highlightedField,
  className = '',
}: SchemaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightOverlayRef = useRef<HTMLDivElement>(null);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());

  const lines = value.split('\n');
  const lineCount = lines.length;

  // Sync scroll between textarea, line numbers, and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && highlightOverlayRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      lineNumbersRef.current.scrollTop = scrollTop;
      highlightOverlayRef.current.scrollTop = scrollTop;
    }
  };

  // Handle Tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const lines = selectedText.split('\n');
        const newLines = lines.map(line => {
          // Remove up to 2 spaces from the start
          if (line.startsWith('  ')) {
            return line.substring(2);
          } else if (line.startsWith(' ')) {
            return line.substring(1);
          }
          return line;
        });
        const newText = newLines.join('\n');

        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = before + newText + after;

        onChange(newValue);

        // Restore selection
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + newText.length;
        }, 0);
      } else {
        // Tab: Indent
        if (start === end) {
          // No selection - insert 2 spaces at cursor
          const before = value.substring(0, start);
          const after = value.substring(start);
          const newValue = before + '  ' + after;

          onChange(newValue);

          // Move cursor after inserted spaces
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        } else {
          // Selection - indent all lines
          const lines = selectedText.split('\n');
          const newLines = lines.map(line => '  ' + line);
          const newText = newLines.join('\n');

          const before = value.substring(0, start);
          const after = value.substring(end);
          const newValue = before + newText + after;

          onChange(newValue);

          // Restore selection
          setTimeout(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + newText.length;
          }, 0);
        }
      }
    }
  };

  // Find and highlight lines containing the selected field
  useEffect(() => {
    if (!highlightedField) {
      setHighlightedLines(new Set());
      return;
    }

    const newHighlightedLines = new Set<number>();

    // Handle nested field paths (e.g., "personalInfo.fullName")
    const fieldParts = highlightedField.split('.');
    const lastFieldName = fieldParts[fieldParts.length - 1];

    // Find the field definition in the schema
    // Look for "fieldName": { for the last part of the path
    const fieldPattern = new RegExp(`"${lastFieldName}"\\s*:\\s*{`, 'g');

    let inFieldDefinition = false;
    let braceDepth = 0;
    let fieldStartLine = -1;

    lines.forEach((line, index) => {
      if (!inFieldDefinition) {
        // Check if this line starts the field definition
        if (fieldPattern.test(line)) {
          inFieldDefinition = true;
          fieldStartLine = index;
          braceDepth = 0;
          newHighlightedLines.add(index);

          // Count braces on this line
          for (const char of line) {
            if (char === '{') braceDepth++;
            if (char === '}') braceDepth--;
          }
        }
      } else {
        // We're inside the field definition
        newHighlightedLines.add(index);

        // Count braces to find the end
        for (const char of line) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }

        // If we've closed all braces, we're done
        if (braceDepth <= 0) {
          inFieldDefinition = false;
        }
      }
    });

    setHighlightedLines(newHighlightedLines);

    // Scroll to the highlighted field
    if (fieldStartLine >= 0 && textareaRef.current) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => {
        if (!textareaRef.current) return;

        // Get computed line height from the textarea
        const computedStyle = window.getComputedStyle(textareaRef.current);
        const lineHeightStr = computedStyle.lineHeight;
        const lineHeight = parseFloat(lineHeightStr);

        const scrollTop = fieldStartLine * lineHeight;
        const visibleHeight = textareaRef.current.clientHeight;

        // Center the highlighted section in the viewport
        const targetScroll = scrollTop - (visibleHeight / 2) + (lineHeight * 2);

        // Smooth scroll to the target position
        textareaRef.current.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }, 50);
    }
  }, [highlightedField, value]);

  return (
    <div className={`flex overflow-hidden ${className}`}>
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="bg-gray-800 text-gray-500 text-right pr-4 pl-4 py-4 select-none overflow-hidden font-mono text-sm leading-relaxed border-r border-gray-700"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => {
          const lineNumber = i + 1;
          const isHighlighted = highlightedLines.has(i);

          return (
            <div
              key={lineNumber}
              className={`${
                isHighlighted
                  ? 'text-blue-400 font-semibold bg-blue-900 bg-opacity-30 -mx-4 px-4'
                  : ''
              }`}
            >
              {lineNumber}
            </div>
          );
        })}
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 relative">
        {/* Highlighted Lines Background Overlay */}
        <div
          ref={highlightOverlayRef}
          className="absolute inset-0 pointer-events-none overflow-hidden font-mono text-sm leading-relaxed px-6 py-4"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          {lines.map((line, index) => {
            const isHighlighted = highlightedLines.has(index);
            return (
              <div
                key={index}
                className={`${
                  isHighlighted
                    ? 'bg-blue-900 bg-opacity-20 border-l-2 border-blue-500 -ml-6 pl-6'
                    : ''
                }`}
              >
                {/* Use non-breaking space to maintain line height */}
                {'\u00A0'}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="relative w-full h-full px-6 py-4 bg-transparent text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-auto"
          style={{
            tabSize: 2,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            caretColor: 'white',
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
