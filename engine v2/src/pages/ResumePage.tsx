import React, { useState, useEffect } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { generateResume, getSuggestedSkills } from '../services/gemini';
import { GraduationCap, Loader2, Zap, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

export const ResumePage: React.FC = () => {
  const { profile, latestAnalysis } = useDashboard();
  const [resume, setResume] = useState<string | null>(null);
  const [resumeTemplate, setResumeTemplate] = useState<'Chronological' | 'Functional' | 'Combination'>('Combination');
  const [generating, setGenerating] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [fetchingSkills, setFetchingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = async () => {
    if (!profile || !profile.education) {
      setError("Please complete your profile (Education is required) first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await generateResume(profile, resumeTemplate, latestAnalysis?.analysisResult);
      setResume(res);
    } catch (err: any) {
      console.error("Error generating resume:", err);
      setError(err.message || "Failed to generate resume. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const fetchSkills = async () => {
    if (!profile) return;
    setFetchingSkills(true);
    try {
      const res = await getSuggestedSkills(profile);
      setSuggestedSkills(res);
    } finally {
      setFetchingSkills(false);
    }
  };

  useEffect(() => {
    if (suggestedSkills.length === 0) {
      fetchSkills();
    }
  }, []);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-extrabold text-primary">AI Resume Builder</h2>
          <p className="text-on-surface-variant font-body text-sm">Craft a professional resume tailored to your Indian career goals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={resumeTemplate}
            onChange={(e) => setResumeTemplate(e.target.value as any)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-label font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Chronological">Chronological</option>
            <option value="Functional">Functional</option>
            <option value="Combination">Combination</option>
          </select>
          <button onClick={fetchResume} disabled={generating} className="bg-primary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            Build AI Resume
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          {error}
        </div>
      )}

      {/* Suggested Skills Section */}
      <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-secondary" />
            <h3 className="text-xl font-headline font-bold text-on-surface">Suggested Skills for You</h3>
          </div>
          <button 
            onClick={fetchSkills} 
            disabled={fetchingSkills}
            className="text-primary font-label font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2"
          >
            {fetchingSkills ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.length > 0 ? suggestedSkills.map((skill, idx) => (
            <span key={idx} className="bg-surface-container-lowest border border-outline-variant/20 px-4 py-2 rounded-full text-sm font-body text-on-surface-variant shadow-sm">
              {skill}
            </span>
          )) : (
            <p className="text-outline text-sm font-body italic">Fetching relevant skills based on your ambition...</p>
          )}
        </div>
      </div>

      {resume && (
        <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/20 shadow-editorial relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
          <div className="markdown-body text-on-surface-variant leading-relaxed">
            <Markdown>{resume}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
