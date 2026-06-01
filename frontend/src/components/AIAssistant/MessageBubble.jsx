import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Clock } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isGrok = message.sender === 'grok';

  return (
    <div className={`flex gap-3 w-full ${isGrok ? 'justify-start' : 'justify-end'}`}>
      {/* Avatar (Left side for Grok) */}
      {isGrok && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      )}

      {/* Bubble body */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1`}>
        {/* Username & Time */}
        <div className={`flex items-center gap-2 px-1 text-[10px] text-muted-foreground ${!isGrok ? 'justify-end' : 'justify-start'}`}>
          <span className="font-bold uppercase tracking-wider">{isGrok ? 'Grok AI' : 'Operator'}</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message bubble card */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm border shadow-sm text-left ${
            isGrok
              ? 'glass-panel border-border text-foreground'
              : 'bg-primary-550 border-primary-550 text-white dark:bg-primary-700 dark:border-primary-700'
          }`}
        >
          {isGrok ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-left break-words">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-primary-550 dark:text-primary-300">{children}</strong>,
                  code: ({ children }) => <code className="bg-secondary/80 text-foreground px-1.5 py-0.5 rounded font-mono text-xs">{children}</code>
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
      </div>

      {/* Avatar (Right side for User) */}
      {!isGrok && (
        <div className="w-9 h-9 rounded-xl bg-secondary text-muted-foreground border border-border flex items-center justify-center shrink-0 shadow-sm">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
