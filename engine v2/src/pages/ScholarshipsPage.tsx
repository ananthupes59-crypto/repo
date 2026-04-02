import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { getScholarships } from '../services/gemini';
import { Award, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export const ScholarshipsPage: React.FC = () => {
  const { profile } = useDashboard();
  const [scholarships, setScholarships] = useState<{ text: string; sources: any[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = async () => {
    if (!profile || !profile.education) {
      setError("Please complete your profile (Education is required) first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await getScholarships(profile);
      setScholarships(res);
    } catch (err: any) {
      console.error("Error fetching scholarships:", err);
      setError(err.message || "Failed to fetch scholarships. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-headline font-extrabold text-primary">Scholarship Finder</h2>
        <button onClick={fetchScholarships} disabled={generating} className="bg-secondary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
          Find Scholarships
        </button>
      </div>
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          {error}
        </div>
      )}
      {scholarships && (
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/20 shadow-editorial">
          <div className="markdown-body text-on-surface-variant leading-relaxed">
            <Markdown>{scholarships.text}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
