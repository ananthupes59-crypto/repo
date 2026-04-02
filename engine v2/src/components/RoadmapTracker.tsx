import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Milestone, UserProfile } from '../types';
import { db, auth, doc, updateDoc, arrayUnion, increment } from '../firebase';
import { MilestoneVerification } from './MilestoneVerification';

interface RoadmapTrackerProps {
  milestones: Milestone[];
  userProfile: UserProfile;
  onUpdate: () => void;
}

export const RoadmapTracker: React.FC<RoadmapTrackerProps> = ({ milestones, userProfile, onUpdate }) => {
  const [completing, setCompleting] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [verifyingMilestone, setVerifyingMilestone] = React.useState<Milestone | null>(null);
  const completedMilestones = userProfile.completedMilestones || [];

  const handleComplete = async (milestone: Milestone) => {
    if (!auth.currentUser || completedMilestones.includes(milestone.id)) return;
    
    setCompleting(milestone.id);
    setError(null);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        completedMilestones: arrayUnion(milestone.id),
        points: increment(milestone.points),
        level: increment(completedMilestones.length % 3 === 0 ? 1 : 0)
      });
      onUpdate();
    } catch (err: any) {
      console.error('Error completing milestone:', err);
      setError("Failed to complete milestone. Please try again.");
    } finally {
      setCompleting(null);
    }
  };

  const progress = milestones.length > 0 ? (completedMilestones.length / milestones.length) * 100 : 0;

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Career Progression</span>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Your <span className="text-primary">Roadmap</span>
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-primary/10 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Total Points</p>
              <p className="text-2xl font-headline font-bold text-primary">{userProfile.points || 0}</p>
            </div>
          </div>
          <div className="bg-secondary/10 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-headline font-bold text-secondary">{completedMilestones.length}/{milestones.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm">
          {error}
        </div>
      )}
      <div className="bg-surface-container-low p-8 rounded-3xl border border-surface-container-high space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="font-headline font-bold text-xl text-on-surface">Path Completion</h4>
            <p className="text-sm text-on-surface-variant font-body">Track your journey to the top</p>
          </div>
          <div className="text-right">
            <span className="font-headline text-4xl font-black text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
        
        <div className="relative h-6 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-container to-secondary rounded-full"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
          </motion.div>
        </div>

        <div className="flex justify-between">
          {milestones.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < completedMilestones.length ? 'bg-primary' : 'bg-surface-container-highest'}`}
            />
          ))}
        </div>
      </div>

      {/* Milestones Tree */}
      <div className="relative space-y-8 before:absolute before:left-[1.65rem] before:top-4 before:bottom-4 before:w-1 before:bg-surface-container-high">
        {milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => {
          const isCompleted = completedMilestones.includes(milestone.id);
          const isNext = !isCompleted && (idx === 0 || completedMilestones.includes(milestones[idx-1].id));

          return (
            <motion.div 
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative pl-16 group ${isCompleted ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className={`absolute left-0 top-0 w-14 h-14 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${isCompleted ? 'bg-primary text-on-primary' : isNext ? 'bg-surface-container-highest text-primary border-4 border-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-6 h-6" />}
              </div>
              
              <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isCompleted ? 'bg-primary/5 border-primary/20' : isNext ? 'bg-surface-container-low border-primary shadow-editorial' : 'bg-surface-container-low border-transparent'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-label text-xs font-bold text-secondary uppercase tracking-widest">Milestone {milestone.order}</span>
                      {isCompleted && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span>}
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-on-surface">{milestone.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed">{milestone.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Reward</p>
                      <p className="text-lg font-headline font-bold text-secondary">+{milestone.points} pts</p>
                    </div>
                    {isNext && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVerifyingMilestone(milestone)}
                        disabled={completing === milestone.id}
                        className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
                      >
                        {completing === milestone.id ? 'Processing...' : 'Verify & Complete'}
                        <ShieldCheck className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/10 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <Star className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-headline font-bold text-on-surface">Keep Going, {userProfile.displayName?.split(' ')[0]}!</h4>
          <p className="text-on-surface-variant">Every milestone you complete brings you closer to your dream career and unlocks exclusive rewards.</p>
        </div>
      </div>

      <AnimatePresence>
        {verifyingMilestone && (
          <MilestoneVerification 
            milestone={verifyingMilestone}
            userProfile={userProfile}
            onComplete={() => {
              handleComplete(verifyingMilestone);
              setVerifyingMilestone(null);
            }}
            onCancel={() => setVerifyingMilestone(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
