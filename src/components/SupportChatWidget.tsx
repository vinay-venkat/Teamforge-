import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronDown, 
  HelpCircle,
  Minimize2
} from 'lucide-react';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  "How do I post an open project?",
  "What is the Team Balance Score?",
  "How can I find a UI/UX designer?",
  "Where do I view my pending invites?"
];

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Hi there! I'm your TeamForge Assistant. Ask me anything about posting projects, forming multidisciplinary teams, checking your Team Balance Score, or sending invites!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userEntry: ChatEntry = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      const botReply = data.reply || "I'm here to help you navigate TeamForge! Feel free to ask another question.";

      const assistantEntry: ChatEntry = {
        id: `msg-${Date.now()}-bot`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantEntry]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.warn('Chat request failed, fallback message:', err);
      const fallbackEntry: ChatEntry = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: "TeamForge helps you discover hackathon projects, assemble balanced squads with engineering, design, AI, and pitching skills, and manage project invitations via the Requests Hub.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackEntry]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          id="teamforge-chat-window"
          className="w-[92vw] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-stone-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5 text-white">
                  TeamForge Guide
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h3>
                <p className="text-[11px] text-stone-300">Ask questions about TeamForge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="minimize-chat-btn"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800 transition-colors"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                id="close-chat-btn"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200 flex-shrink-0 flex items-center justify-center text-amber-800 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    isUser 
                      ? 'bg-amber-600 text-white rounded-br-xs' 
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className={`block text-[10px] mt-1 text-right ${isUser ? 'text-amber-200' : 'text-stone-400'}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs py-1">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-800">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl px-3 py-2 text-xs text-stone-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 py-2 bg-stone-100/70 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-stone-400 font-medium whitespace-nowrap">Suggested:</span>
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap px-2 py-1 rounded-md bg-white border border-stone-200 text-stone-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-colors text-[11px] cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-stone-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                id="teamforge-chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about TeamForge, projects, synergy..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 placeholder-stone-400"
              />
              <button
                id="teamforge-chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 px-1">
              <span>Instant answers for student collaborators</span>
              <span>Gemini 3.8</span>
            </div>
          </div>

        </div>
      )}

      {/* Floating Toggle Button on the Right Corner */}
      <button
        id="teamforge-floating-chat-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg hover:shadow-xl border border-stone-700/80 transition-all active:scale-95 cursor-pointer"
        aria-label="Open TeamForge Help Chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-stone-900">
              {unreadCount}
            </span>
          )}
        </div>

        <span className="text-xs font-semibold tracking-wide pr-1">
          {isOpen ? 'Close Chat' : 'Ask TeamForge'}
        </span>

        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

    </div>
  );
};
