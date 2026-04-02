import React from 'react';
import { db, auth, doc, setDoc, getDoc, Timestamp, OperationType, handleFirestoreError } from '../firebase';
import { UserProfile } from '../types';
import { Save, GraduationCap, Briefcase, Heart, Target, Loader2, User as UserIcon, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileFormProps {
  onSave?: (profile: UserProfile) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSave }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Partial<UserProfile>>({
    education: '',
    employment: '',
    interests: '',
    ambition: '',
    language: 'English',
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    setError(null);
    try {
      const profileData = {
        ...profile,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        createdAt: profile.createdAt || Timestamp.now(),
        points: profile.points || 0,
        completedMilestones: profile.completedMilestones || [],
        level: profile.level || 1,
      };
      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData);
      if (onSave) onSave(profileData as UserProfile);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Left: Editorial Content */}
      <div className="lg:w-1/3 flex flex-col">
        <span className="font-label text-secondary font-bold tracking-widest uppercase mb-4 text-sm">Step 01 of 02</span>
        <h2 className="font-headline text-5xl font-extrabold text-primary leading-tight tracking-tight mb-8">
          Your future, <br/>beautifully <br/>mapped.
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
          We're tailoring a personalized roadmap based on your Indian academic background and global career aspirations.
        </p>
        <div className="mt-auto hidden lg:block">
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary">
            <p className="font-label text-sm text-on-surface-variant italic leading-relaxed">
              "Choosing the right board and stream in India is the first step toward a global career. We help you bridge that gap."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">PR</div>
              <span className="font-label text-xs font-bold text-on-surface tracking-wide uppercase">Pragati AI Analyst</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form Canvas */}
      <div className="lg:w-2/3">
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-12">
          <div className="space-y-8">
            <h3 className="text-3xl font-headline font-bold text-on-surface">Profile Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider px-1">Current Education *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    placeholder="e.g., 12th Pass (Science), B.Tech"
                    className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary-container transition-all placeholder:text-outline-variant text-on-surface"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider px-1">Current Employment</label>
                <input
                  type="text"
                  value={profile.employment}
                  onChange={(e) => setProfile({ ...profile, employment: e.target.value })}
                  placeholder="e.g., Unemployed, Intern"
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary-container transition-all placeholder:text-outline-variant text-on-surface"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider px-1">Interests</label>
                <input
                  type="text"
                  value={profile.interests}
                  onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                  placeholder="e.g., AI, Finance"
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary-container transition-all placeholder:text-outline-variant text-on-surface"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider px-1">Ambition</label>
                <input
                  type="text"
                  value={profile.ambition}
                  onChange={(e) => setProfile({ ...profile, ambition: e.target.value })}
                  placeholder="e.g., Data Scientist"
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary-container transition-all placeholder:text-outline-variant text-on-surface"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider px-1">Preferred Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 appearance-none focus:ring-2 focus:ring-primary-container transition-all text-on-surface"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t-2 border-surface-container-low flex flex-col md:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl shadow-primary/20"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              Save Profile & Continue
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                if (!auth.currentUser) return;
                setRefreshing(true);
                try {
                  const docRef = doc(db, 'users', auth.currentUser.uid);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setProfile(data);
                    if (onSave) onSave(data);
                  }
                } catch (error) {
                  console.error('Error refreshing profile:', error);
                } finally {
                  setRefreshing(false);
                }
              }}
              className="px-10 py-4 rounded-full bg-surface-container-highest text-on-surface-variant font-headline font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
              disabled={refreshing}
            >
              <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            {!showConfirmClear ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="px-10 py-4 rounded-full bg-error/10 text-error font-headline font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <Trash2 className="w-6 h-6" />
                Clear Data
              </motion.button>
            ) : (
              <div className="flex items-center gap-4 bg-error/5 p-2 rounded-full border border-error/20">
                <span className="font-label text-xs font-bold text-error uppercase tracking-wider pl-4">Confirm Delete?</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    setSaving(true);
                    try {
                      const profileData = {
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        displayName: auth.currentUser.displayName,
                        education: '',
                        employment: '',
                        interests: '',
                        ambition: '',
                        language: 'English',
                        createdAt: Timestamp.now(),
                        points: 0,
                        completedMilestones: [],
                        level: 1,
                      };
                      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData);
                      setProfile(profileData);
                      if (onSave) onSave(profileData as UserProfile);
                      setShowConfirmClear(false);
                    } catch (error) {
                      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="bg-error text-on-error px-6 py-2 rounded-full font-label font-bold text-xs uppercase"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="text-on-surface-variant px-4 py-2 font-label font-bold text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};


