import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { RoadmapTracker } from '../components/RoadmapTracker';
import { Map, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoadmapPage: React.FC = () => {
  const { profile, roadmap, generating, error, generateGuidance, hasConsent, setHasConsent } = useDashboard();
  const navigate = useNavigate();

  const isProfileComplete = (p: any) => !!(p && p.education && p.ambition && p.interests);

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-32">
      {!roadmap && !generating && (
        <div className="bg-surface-container-lowest p-16 rounded-[2.5rem] shadow-editorial-lg text-center space-y-8">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
            <Map className="w-12 h-12 text-on-surface-variant opacity-20" />
          </div>
          <div className="space-y-6 max-w-md mx-auto">
            <h3 className="font-headline text-3xl font-bold text-on-surface">Build Your Roadmap</h3>
            
            {!isProfileComplete(profile) ? (
              <div className="bg-error/5 border border-error/20 p-6 rounded-2xl space-y-4">
                <p className="text-error font-medium">Your profile is incomplete. We need your education, interests, and ambition to craft a personalized roadmap.</p>
                <button 
                  onClick={() => navigate('/dashboard/profile')}
                  className="bg-error text-on-error px-8 py-3 rounded-full font-label font-bold text-sm uppercase tracking-widest"
                >
                  Complete Profile
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Generate a structured career roadmap with milestones and rewards to track your progress.
                </p>
                
                <div className="flex items-start gap-3 text-left bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <input 
                    type="checkbox" 
                    id="roadmap-consent"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <label htmlFor="roadmap-consent" className="text-sm text-on-surface-variant cursor-pointer">
                    I consent to the AI analyzing my profile and generating a personalized career achievement path. I understand this data will be stored to track my progress.
                  </label>
                </div>

                {error && (
                  <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
                    {error}
                  </div>
                )}

                <button 
                  onClick={generateGuidance}
                  disabled={!hasConsent}
                  className={`w-full px-10 py-4 rounded-full font-headline font-bold text-lg shadow-xl transition-all ${hasConsent ? 'bg-primary text-on-primary shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50'}`}
                >
                  Start My Journey
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {roadmap && profile && (
        <div className="space-y-6">
          <div className="flex justify-end items-center gap-4">
            {error && (
              <div className="bg-error/10 text-error px-4 py-2 rounded-xl font-label text-xs">
                {error}
              </div>
            )}
            <button 
              onClick={generateGuidance}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-primary rounded-full font-label font-bold text-xs uppercase tracking-widest hover:bg-primary/10 transition-all"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Re-generate Roadmap
            </button>
          </div>
          <RoadmapTracker 
            milestones={roadmap.milestones} 
            userProfile={profile} 
            onUpdate={() => {}} 
          />
        </div>
      )}
      {generating && (
        <div className="bg-surface-container-lowest p-16 rounded-[2.5rem] shadow-editorial-lg flex flex-col items-center justify-center space-y-8">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <p className="font-headline text-2xl font-bold text-on-surface">Crafting your career path...</p>
        </div>
      )}
    </div>
  );
};
