import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { RewardStore } from '../components/RewardStore';

export const RewardsPage: React.FC = () => {
  const { profile, triggerRefresh } = useDashboard();

  if (!profile) {
    return (
      <div className="pb-32">
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          Please complete your profile first.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <RewardStore userProfile={profile} onUpdate={triggerRefresh} />
    </div>
  );
};
