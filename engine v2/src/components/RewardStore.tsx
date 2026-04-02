import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Book, FileText, Gift, Star, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Reward, UserProfile, Redemption } from '../types';
import { db, auth, collection, addDoc, updateDoc, doc, increment, Timestamp, query, where, onSnapshot, orderBy } from '../firebase';

interface RewardStoreProps {
  userProfile: UserProfile;
  onUpdate: () => void;
}

const MOCK_REWARDS: Reward[] = [
  { id: 'r1', title: 'NCERT Textbook Set', description: 'Complete set of NCERT textbooks for your current grade.', pointsCost: 500, category: 'book' },
  { id: 'r2', title: 'Premium Study Notes', description: 'Handwritten notes from top rankers in your field.', pointsCost: 200, category: 'note' },
  { id: 'r3', title: 'Career Yearbook 2026', description: 'Exclusive insights into the 2026 Indian job market.', pointsCost: 350, category: 'yearbook' },
  { id: 'r4', title: '1-on-1 Mentorship Session', description: 'A 30-minute call with an industry expert.', pointsCost: 1000, category: 'other' },
];

export const RewardStore: React.FC<RewardStoreProps> = ({ userProfile, onUpdate }) => {
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([]);
  const [redeeming, setRedeeming] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'redemptions'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRedemptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redemption)));
    });
    return () => unsubscribe();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!auth.currentUser || userProfile.points < reward.pointsCost) {
      setError('Insufficient points to redeem this reward.');
      return;
    }

    setRedeeming(reward.id);
    setError(null);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        points: increment(-reward.pointsCost)
      });

      await addDoc(collection(db, 'redemptions'), {
        userId: auth.currentUser.uid,
        rewardId: reward.id,
        status: 'pending',
        timestamp: Timestamp.now()
      });

      onUpdate();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Redemption Store</span>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Unlock Your <span className="text-primary">Rewards</span>
          </h2>
        </div>
        <div className="bg-secondary/10 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Available Points</p>
            <p className="text-2xl font-headline font-bold text-secondary">{userProfile.points || 0}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 text-error bg-error/10 p-6 rounded-2xl border border-error/20"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_REWARDS.map((reward, idx) => {
          const isRedeemed = redemptions.some(r => r.rewardId === reward.id);
          const canAfford = userProfile.points >= reward.pointsCost;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-low p-8 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all group flex flex-col h-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                {reward.category === 'book' && <Book className="w-8 h-8" />}
                {reward.category === 'note' && <FileText className="w-8 h-8" />}
                {reward.category === 'yearbook' && <ShoppingBag className="w-8 h-8" />}
                {reward.category === 'other' && <Gift className="w-8 h-8" />}
              </div>
              
              <div className="flex-grow space-y-3">
                <h3 className="text-xl font-headline font-bold text-on-surface">{reward.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{reward.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-surface-container-high space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Cost</span>
                  <span className="font-headline text-lg font-bold text-secondary">{reward.pointsCost} pts</span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRedeem(reward)}
                  disabled={isRedeemed || !canAfford || redeeming === reward.id}
                  className={`w-full py-3 rounded-full font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all ${isRedeemed ? 'bg-primary/10 text-primary cursor-default' : canAfford ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
                >
                  {redeeming === reward.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isRedeemed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Redeemed
                    </>
                  ) : (
                    'Redeem Now'
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {redemptions.length > 0 && (
        <div className="pt-12 border-t-2 border-surface-container-low">
          <h3 className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Recent Redemptions</h3>
          <div className="space-y-4">
            {redemptions.map(redemption => {
              const reward = MOCK_REWARDS.find(r => r.id === redemption.rewardId);
              return (
                <div key={redemption.id} className="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-surface-container-high">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-surface">{reward?.title}</p>
                      <p className="text-xs text-on-surface-variant uppercase font-label tracking-wider">{redemption.timestamp?.toDate ? new Date(redemption.timestamp.toDate()).toLocaleDateString() : 'Just now'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${redemption.status === 'delivered' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {redemption.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
