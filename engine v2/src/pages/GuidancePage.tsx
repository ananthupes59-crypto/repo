import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { GuidanceDisplay } from '../components/GuidanceDisplay';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GuidancePage: React.FC = () => {
  const { profile, latestGuidance, generating, error } = useDashboard();
  const navigate = useNavigate();

  const isProfileComplete = (p: any) => !!(p && p.education && p.ambition && p.interests);

  return (
    <div className="space-y-8 pb-32">
      {!isProfileComplete(profile) && (
        <div className="bg-tertiary-container/10 border border-tertiary-container/20 p-8 rounded-[2.5rem] flex items-center gap-6 text-tertiary">
          <RefreshCw className="w-8 h-8 animate-spin-slow" />
          <div>
            <p className="font-headline font-bold text-xl">Profile Incomplete</p>
            <p className="font-body opacity-80">Please complete your profile (Education, Interests, Ambition) to get personalized guidance.</p>
          </div>
          <button onClick={() => navigate('/dashboard/profile')} className="ml-auto bg-tertiary text-on-primary px-6 py-3 rounded-full font-label font-bold text-sm">Complete Profile</button>
        </div>
      )}
      {error && (
        <div className="bg-error/10 text-error p-6 rounded-2xl font-label text-sm border border-error/20">
          {error}
        </div>
      )}
      <GuidanceDisplay guidance={latestGuidance} loading={generating} />
    </div>
  );
};
