import React, { useState } from 'react';
import { api } from '../api';
import { Bot, Send, Sparkles, Cpu, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  isLiveGemini?: boolean;
  sourceContext?: string;
  suggestions?: string[];
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: (
        "Hello! I am **EduPulse AI**, your empathetic academic learning assistant. "
        + "I am here to help you break down complex concepts, practice tricky exam questions, "
        + "and prepare effectively before semester tests.\n\n"
        + "What concept would you like to review today?"
      ),
      isLiveGemini: false,
      sourceContext: "EduPulse Syllabus-Grounded Academic Knowledge Engine",
      suggestions: [
        "Explain Java Arrays with memory diagrams",
        "How do Singly Linked Lists handle deletion?",
        "Give me 3 practice MCQ questions on DBMS Normalization",
        "What causes an ArrayIndexOutOfBoundsException?"
      ]
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.aiChat({ message: query });
      const botMsg: ChatMessage = {
        sender: 'assistant',
        text: res.response,
        isLiveGemini: res.is_live_gemini,
        sourceContext: res.source_context,
        suggestions: res.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error connecting to learning assistant: ${err.message || 'Service unavailable'}`,
          isLiveGemini: false,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">EduPulse AI Learning Tutor</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                Grounded Academic Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized concept explanations, code tracing, and practice quizzes
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-slate-500 block">Status: Online</span>
          <span className="text-[10px] text-teal-700 font-semibold">Gemini 2.5 Flash + Fallback Ready</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.sender === 'assistant' && (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-mono text-teal-700">
                    <Sparkles className="h-3 w-3" />
                    {m.isLiveGemini ? 'Live Gemini 2.5 API' : 'EduPulse Rule-Based Tutor'}
                  </span>
                  {m.sourceContext && (
                    <span className="text-slate-500 truncate max-w-xs">{m.sourceContext}</span>
                  )}
                </div>
              )}
            </div>

            {/* Prompt Suggestions */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-2xl">
                {m.suggestions.map((s, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => sendMessage(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-800 transition-colors shadow-2xs font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-xs animate-pulse shadow-2xs">
            <Sparkles className="h-4 w-4 text-teal-600 animate-spin" />
            <span>EduPulse is preparing concept explanation...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about Java Arrays, Linked Lists, Normalization, or exam patterns..."
            className="flex-1 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
