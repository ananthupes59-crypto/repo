import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { getEntranceExams } from '../services/gemini';
import { ClipboardList, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export const ExamsPage: React.FC = () => {
  const { profile } = useDashboard();
  const [exams, setExams] = useState<{ text: string; sources: any[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async () => {
    if (!profile || !profile.education) {
      setError("Please complete your profile (Education is required) first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await getEntranceExams(profile);
      setExams(res);
    } catch (err: any) {
      console.error("Error fetching exams:", err);
      setError(err.message || "Failed to fetch exams. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-headline font-extrabold text-primary">Entrance Exam Tracker</h2>
        <button onClick={fetchExams} disabled={generating} className="bg-primary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
          Track Exams
        </button>
      </div>
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          {error}
        </div>
      )}
      {exams && (
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/20 shadow-editorial">
          <div className="markdown-body text-on-surface-variant leading-relaxed">
            <Markdown>{exams.text}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
