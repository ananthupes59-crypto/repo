import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Compass, FileText, Sparkles, Loader2, Star, Map, Award, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

export const Overview: React.FC = () => {
  const { profile, latestAnalysis, latestGuidance, roadmap, generating, error, generateGuidance } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="space-y-12 pb-32">
      {/* Hero Editorial Greeting */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface">
            Namaste, {profile?.displayName?.split(' ')[0] || 'Aspirant'}
          </h1>
          <p className="text-xl text-on-surface-variant opacity-80 max-w-2xl font-body">
            Your journey towards <span className="text-primary font-semibold">{profile?.ambition || 'your career goals'}</span> is gaining momentum.
          </p>
        </div>
        
        {profile && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Level {profile.level || 1}</p>
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (profile.level || 1) % 5 ? 'fill-primary' : 'text-surface-container-highest'}`} />
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-surface-container-high"></div>
            <div className="bg-surface-container-lowest px-6 py-3 rounded-2xl shadow-editorial border border-surface-container-low flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-2xl font-headline font-bold text-on-surface">{profile.points || 0}</span>
            </div>
          </div>
        )}
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Academic DNA / Roadmap Progress Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-editorial relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <Compass className="w-16 h-16 opacity-5 text-primary scale-150 group-hover:scale-[2] transition-transform duration-700" />
          </div>
          <div className="relative z-10">
            <span className="font-label text-xs font-extrabold uppercase tracking-[0.2em] text-secondary mb-4 block">Current Milestone</span>
            <h2 className="font-headline text-3xl font-bold mb-6">Academic DNA & Roadmap</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div className="space-y-2">
                <span className="font-label text-xs uppercase tracking-widest text-outline">Analytical Core</span>
                <div className="text-4xl font-headline font-extrabold">8.4</div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[84%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-label text-xs uppercase tracking-widest text-outline">Linguistic Aptitude</span>
                <div className="text-4xl font-headline font-extrabold">9.1</div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[91%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-label text-xs uppercase tracking-widest text-outline">Digital Literacy</span>
                <div className="text-4xl font-headline font-extrabold">7.8</div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[78%]"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {error && (
                <div className="w-full bg-error/10 text-error p-4 rounded-xl font-label text-sm mb-2">
                  {error}
                </div>
              )}
              <button 
                onClick={generateGuidance}
                disabled={generating}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {latestGuidance ? 'Refresh Roadmap' : 'Generate Roadmap'}
              </button>
              <button 
                onClick={() => navigate('/dashboard/roadmap')}
                className="bg-surface-container-low text-primary px-8 py-4 rounded-full font-label font-bold text-sm tracking-wide hover:bg-surface-container-high transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action: Analyze Mark Sheet */}
        <div className="md:col-span-4 bg-primary rounded-[2.5rem] p-8 shadow-editorial text-on-primary flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <FileText className="text-on-primary w-8 h-8" />
            </div>
            <h3 className="font-headline text-2xl font-bold mb-2">Analyze Mark Sheet</h3>
            <p className="font-body text-on-primary/70 text-sm leading-relaxed">
              Upload your latest mock test or semester marks to get AI-powered insights on your weak zones.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/analysis')}
            className="mt-8 w-full bg-surface-container-lowest text-primary py-4 rounded-xl font-label font-bold text-sm hover:bg-white/90 transition-colors"
          >
            Start Analysis
          </button>
        </div>

        {/* Resume Builder Quick Link */}
        <div className="md:col-span-12 bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-editorial border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-tertiary" />
              <h3 className="font-headline text-xl font-bold">AI Resume Builder</h3>
            </div>
            <p className="text-on-surface-variant font-body text-sm mb-6">
              Craft a professional resume tailored to your Indian career goals using AI.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/resume')}
            className="w-full bg-tertiary/10 text-tertiary py-4 rounded-xl font-label font-bold text-sm hover:bg-tertiary/20 transition-colors"
          >
            Build Resume
          </button>
        </div>
        
        {/* Latest Guidance Snippet */}
        {latestGuidance && (
          <div className="md:col-span-12 bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-editorial border border-outline-variant/20">
            <h3 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Latest Guidance Snippet
            </h3>
            <div className="prose prose-sm max-w-none text-on-surface-variant line-clamp-3">
              <Markdown>{latestGuidance.recommendations}</Markdown>
            </div>
            <button 
              onClick={() => navigate('/dashboard/guidance')}
              className="mt-4 text-primary font-label font-bold text-xs uppercase tracking-widest hover:underline"
            >
              Read Full Guidance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
