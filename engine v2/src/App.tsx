import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GraduationCap, Sparkles, MapPin, TrendingUp, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

// New Layout and Pages
import { DashboardProvider } from './contexts/DashboardContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { RoadmapPage } from './pages/RoadmapPage';
import { GuidancePage } from './pages/GuidancePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResumePage } from './pages/ResumePage';
import { InterviewPage } from './pages/InterviewPage';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { ExamsPage } from './pages/ExamsPage';
import { GovtJobsPage } from './pages/GovtJobsPage';
import { RewardsPage } from './pages/RewardsPage';
import { VerificationPage } from './pages/VerificationPage';
import { MockTestPage } from './pages/MockTestPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [user, setUser] = React.useState(auth.currentUser);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container/30">
          {!user ? (
            <>
              <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <GraduationCap className="text-on-primary w-6 h-6" />
                  </div>
                  <span className="text-xl font-extrabold text-primary font-headline tracking-tight">Margdarshak</span>
                </div>
                <Auth />
              </header>
              <main className="pt-16">
                <div className="relative overflow-hidden">
                  {/* Hero Section */}
                  <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-label font-bold uppercase tracking-widest mb-8"
                    >
                      <Sparkles className="w-4 h-4" />
                      Performance Intelligence
                    </motion.div>
                    
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-6xl md:text-8xl font-headline font-extrabold text-primary tracking-tighter mb-8 leading-[0.9]"
                    >
                      UNCOVER YOUR <br />
                      <span className="text-secondary italic">ACADEMIC</span> DNA.
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed"
                    >
                      Upload your mark sheets and let our AI-driven engine decode your strengths, bridge your skill gaps, and project your future percentile in the Indian digital frontier.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant shadow-editorial">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="font-label font-bold text-sm uppercase tracking-wider">Smart Analysis</span>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant shadow-editorial">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <span className="font-label font-bold text-sm uppercase tracking-wider">Local Insights</span>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant shadow-editorial">
                        <TrendingUp className="w-5 h-5 text-tertiary" />
                        <span className="font-label font-bold text-sm uppercase tracking-wider">Market Trends</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Background Decoration */}
                  <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />
                  </div>
                </div>
              </main>
              <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                  <p className="text-on-surface-variant/60 font-label text-xs uppercase tracking-widest font-bold">
                    &copy; {new Date().getFullYear()} Margdarshak. Designed for Growth.
                  </p>
                </div>
              </footer>
            </>
          ) : (
            <DashboardProvider>
              <Routes>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="roadmap" element={<RoadmapPage />} />
                  <Route path="guidance" element={<GuidancePage />} />
                  <Route path="analysis" element={<AnalysisPage />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="interview" element={<InterviewPage />} />
                  <Route path="scholarships" element={<ScholarshipsPage />} />
                  <Route path="exams" element={<ExamsPage />} />
                  <Route path="govt" element={<GovtJobsPage />} />
                  <Route path="rewards" element={<RewardsPage />} />
                  <Route path="verification" element={<VerificationPage />} />
                  <Route path="mocktest" element={<MockTestPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardProvider>
          )}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}


