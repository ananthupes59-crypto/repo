import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, doc, collection, query, where, onSnapshot, orderBy, limit, handleFirestoreError, OperationType, Timestamp, addDoc } from '../firebase';
import { UserProfile, Analysis, Guidance, Roadmap } from '../types';
import { getCareerGuidance, getRoadmapMilestones } from '../services/gemini';

interface DashboardContextType {
  profile: UserProfile | null;
  latestAnalysis: Analysis | null;
  latestGuidance: Guidance | null;
  roadmap: Roadmap | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  refreshKey: number;
  triggerRefresh: () => void;
  generateGuidance: () => Promise<void>;
  hasConsent: boolean;
  setHasConsent: (val: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);
  const [latestGuidance, setLatestGuidance] = useState<Guidance | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasConsent, setHasConsent] = useState(false);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const isProfileComplete = (p: UserProfile | null) => {
    return !!(p && p.education && p.ambition && p.interests);
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) setProfile(doc.data() as UserProfile);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${auth.currentUser?.uid}`));

    const analysesQuery = query(
      collection(db, 'analyses'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribeAnalyses = onSnapshot(analysesQuery, (snapshot) => {
      const analyses = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Analysis));
      setLatestAnalysis(analyses[0] || null);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'analyses'));

    const guidanceQuery = query(
      collection(db, 'guidance'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribeGuidance = onSnapshot(guidanceQuery, (snapshot) => {
      const guidanceList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Guidance));
      setLatestGuidance(guidanceList[0] || null);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'guidance'));

    const roadmapQuery = query(
      collection(db, 'roadmaps'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribeRoadmap = onSnapshot(roadmapQuery, (snapshot) => {
      const roadmaps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Roadmap));
      setRoadmap(roadmaps[0] || null);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'roadmaps'));

    return () => {
      unsubscribeUser();
      unsubscribeAnalyses();
      unsubscribeGuidance();
      unsubscribeRoadmap();
    };
  }, [refreshKey]);

  const generateGuidance = async () => {
    if (!profile || !auth.currentUser) return;
    if (!isProfileComplete(profile)) {
      // Handle incomplete profile in UI
      return;
    }
    if (!hasConsent && !roadmap) return;

    setGenerating(true);
    setError(null);
    try {
      const [guidanceResult, milestones] = await Promise.all([
        getCareerGuidance(profile, latestAnalysis?.analysisResult),
        getRoadmapMilestones(profile, latestAnalysis?.analysisResult)
      ]);

      await Promise.all([
        addDoc(collection(db, 'guidance'), {
          userId: auth.currentUser.uid,
          recommendations: guidanceResult.text,
          sources: guidanceResult.sources,
          timestamp: Timestamp.now(),
        }),
        addDoc(collection(db, 'roadmaps'), {
          userId: auth.currentUser.uid,
          milestones: milestones,
          timestamp: Timestamp.now(),
        })
      ]);
      
    } catch (err: any) {
      console.error('Error generating guidance:', err);
      setError(err.message || "Failed to generate guidance. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardContext.Provider value={{
      profile, latestAnalysis, latestGuidance, roadmap, loading, generating, error, refreshKey, triggerRefresh, generateGuidance, hasConsent, setHasConsent
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
