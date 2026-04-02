import React from 'react';
import { ProfileForm } from '../components/ProfileForm';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-32">
      <ProfileForm onSave={() => {}} />
    </div>
  );
};
