import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { getGovtJobs } from '../services/gemini';
import { Landmark, Loader2, Filter } from 'lucide-react';
import Markdown from 'react-markdown';

export const GovtJobsPage: React.FC = () => {
  const { profile } = useDashboard();
  const [govtJobs, setGovtJobs] = useState<{ text: string; sources: any[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLevel, setSearchLevel] = useState<string>('Profile');

  const qualificationLevels = [
    { id: 'Profile', label: 'My Profile Education' },
    { id: 'Graduate', label: 'Graduate / Degree' },
    { id: '12th Pass', label: '12th Pass' },
    { id: '10th Pass', label: '10th Pass' },
    { id: '8th Pass', label: 'Below 10th / 8th Pass' }
  ];

  const fetchGovtJobs = async () => {
    if (!profile || !profile.education) {
      setError("Please complete your profile (Education is required) first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const levelToSearch = searchLevel === 'Profile' ? profile.education : searchLevel;
      const res = await getGovtJobs(profile, levelToSearch);
      setGovtJobs(res);
    } catch (err: any) {
      console.error("Error fetching govt jobs:", err);
      setError(err.message || "Failed to fetch government jobs. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-extrabold text-primary">Govt Jobs Portal</h2>
          <p className="text-on-surface-variant text-sm">Find opportunities across different qualification levels.</p>
        </div>
        <button onClick={fetchGovtJobs} disabled={generating} className="bg-tertiary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />}
          Find Govt Jobs
        </button>
      </div>

      <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-label text-sm font-bold text-on-surface uppercase tracking-wider">Qualification Filter</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {qualificationLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSearchLevel(level.id)}
              className={`px-5 py-2.5 rounded-full font-label text-xs font-bold transition-all ${
                searchLevel === level.id 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          {error}
        </div>
      )}
      {govtJobs && (
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/20 shadow-editorial">
          <div className="markdown-body text-on-surface-variant leading-relaxed">
            <Markdown>{govtJobs.text}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
