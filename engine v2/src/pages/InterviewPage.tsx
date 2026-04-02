import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { getInterviewCoachResponse } from '../services/gemini';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export const InterviewPage: React.FC = () => {
  const { profile } = useDashboard();
  const [interviewChat, setInterviewChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterviewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !profile.education) {
      setError("Please complete your profile (Education is required) first.");
      return;
    }
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setInterviewChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    setError(null);
    try {
      const aiRes = await getInterviewCoachResponse(userMsg, profile);
      setInterviewChat(prev => [...prev, { role: 'ai', text: aiRes }]);
    } catch (err: any) {
      console.error("Error in interview chat:", err);
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-32">
      <div className="bg-surface-container-low p-8 rounded-[2.5rem] shadow-editorial h-[500px] overflow-y-auto space-y-6 custom-scrollbar">
        {interviewChat.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <MessageSquare className="w-16 h-16 text-outline opacity-20" />
            <p className="text-outline font-body max-w-xs">Start a mock interview! Say something like "I'm ready for the interview" or answer a question.</p>
          </div>
        )}
        {interviewChat.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'user' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-lowest text-on-surface-variant shadow-editorial'}`}>
              <div className="markdown-body">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {chatLoading && <div className="text-primary font-label font-bold animate-pulse flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Coach is thinking...
        </div>}
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleInterviewChat} className="flex gap-3">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your response..."
          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-editorial"
        />
        <button type="submit" className="bg-primary p-4 rounded-2xl text-on-primary hover:opacity-90 shadow-lg transition-all active:scale-95">
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
