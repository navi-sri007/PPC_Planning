import React, { useRef, useEffect } from 'react';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { Send, Sparkles, Trash2, Bot, Loader2 } from 'lucide-react';
import QuickActions from './QuickActions';
import MessageBubble from './MessageBubble';
import ResponseCard from './ResponseCard';
import GanttChart from './GanttChart';

export default function ChatInterface() {
  const {
    messages,
    visualization,
    inputQuestion,
    setInputQuestion,
    isLoading,
    sendMessage,
    clearChat
  } = useAIAssistant();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;
    sendMessage(inputQuestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground text-left flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            AI Production Assistant
          </h2>
          <p className="text-xs text-muted-foreground text-left">
            Ask Grok AI about active machine bookings, job bottlenecks, or project timelines
          </p>
        </div>
        
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer shrink-0"
          title="Clear Chat Logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Conversation
        </button>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions onSelect={sendMessage} disabled={isLoading} />

      {/* Main Chat Box */}
      <div className="border border-border rounded-2xl bg-card shadow-sm flex flex-col h-[450px] overflow-hidden">
        {/* Messages Log Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {/* Main message bubble */}
              <MessageBubble message={msg} />
              
              {/* Structured response payload */}
              {msg.data && msg.data.length > 0 && (
                <div className="ml-12 max-w-[85%] sm:max-w-[75%]">
                  <ResponseCard data={msg.data} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-500 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="glass-panel border-border px-4 py-2.5 rounded-2xl text-xs text-muted-foreground flex items-center gap-1.5">
                <span>Grok is querying database logs</span>
                <div className="typing-dots inline-flex text-indigo-500 font-bold">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card flex items-center gap-2">
          <textarea
            rows="1"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type your production query (e.g. What are the pending jobs?)..."
            className="flex-1 px-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent resize-none leading-relaxed max-h-24 no-scrollbar"
            style={{ height: '42px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="p-2.5 bg-primary-550 hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-primary-550 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Gantt Timetable visualization (Renders below chat when active) */}
      {visualization && visualization.type === 'gantt' && (
        <div className="animate-fade-in duration-300">
          <GanttChart />
        </div>
      )}
    </div>
  );
}
