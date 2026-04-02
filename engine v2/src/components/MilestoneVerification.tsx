import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Upload, CheckCircle2, XCircle, Loader2, ClipboardList, ArrowRight, Trophy, RefreshCw, X } from 'lucide-react';
import { Milestone, UserProfile, MockTest as MockTestType } from '../types';
import { db, auth, collection, addDoc, Timestamp, updateDoc, doc, increment } from '../firebase';
import { verifyDocument, generateMockTest } from '../services/gemini';

interface MilestoneVerificationProps {
  milestone: Milestone;
  userProfile: UserProfile;
  onComplete: () => void;
  onCancel: () => void;
}

export const MilestoneVerification: React.FC<MilestoneVerificationProps> = ({ milestone, userProfile, onComplete, onCancel }) => {
  const [mode, setMode] = React.useState<'select' | 'upload' | 'test' | 'success' | 'failure'>('select');
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
  // Test state
  const [currentTest, setCurrentTest] = React.useState<MockTestType | null>(null);
  const [testLoading, setTestLoading] = React.useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [testScore, setTestScore] = React.useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!selectedFile || !auth.currentUser) return;

    setVerifying(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1];
        if (!base64) throw new Error('Failed to read file');

        const result = await verifyDocument(base64, selectedFile.type, 'Certificate', milestone.title);
        
        if (result.status === 'verified') {
          onComplete();
          setMode('success');
        } else {
          setError(result.details || 'The certificate could not be verified. Please ensure it is a valid certificate related to the milestone.');
          setMode('failure');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify document. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const startTest = async () => {
    setTestLoading(true);
    setCurrentQuestionIdx(0);
    setAnswers({});
    try {
      const testData = await generateMockTest(userProfile, milestone.title);
      setCurrentTest({
        id: Math.random().toString(36).substr(2, 9),
        userId: auth.currentUser?.uid || '',
        timestamp: Timestamp.now(),
        ...testData
      } as MockTestType);
      setMode('test');
    } catch (error) {
      console.error('Error starting test:', error);
      setError('Failed to generate test. Please try again.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const nextQuestion = () => {
    if (currentTest && currentQuestionIdx < currentTest.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    if (!currentTest || !auth.currentUser) return;
    
    setVerifying(true);
    let score = 0;
    currentTest.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    setTestScore(score);

    const passThreshold = Math.ceil(currentTest.questions.length * 0.8); // 80% to pass

    try {
      if (score >= passThreshold) {
        onComplete();
        setMode('success');
      } else {
        setMode('failure');
        setError(`You scored ${score}/${currentTest.questions.length}. You need at least ${passThreshold} correct answers to pass.`);
      }
    } catch (err: any) {
      console.error('Error saving test results:', err);
      setError("Failed to save test results. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Removed completeMilestone function as onComplete handles the DB update

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface-container-lowest w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container-high transition-colors z-20"
        >
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>

        <div className="p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div 
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Verification Required</span>
                  <h2 className="text-3xl font-headline font-extrabold text-on-surface">Complete Milestone</h2>
                  <p className="text-on-surface-variant">{milestone.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setMode('upload')}
                    className="p-8 rounded-3xl border-2 border-surface-container-high hover:border-primary hover:bg-primary/5 transition-all group text-left space-y-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg text-on-surface">Upload Certificate</h4>
                      <p className="text-sm text-on-surface-variant">Upload a PDF or Image of your completion certificate.</p>
                    </div>
                  </button>

                  <button 
                    onClick={startTest}
                    disabled={testLoading}
                    className="p-8 rounded-3xl border-2 border-surface-container-high hover:border-secondary hover:bg-secondary/5 transition-all group text-left space-y-4"
                  >
                    <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                      {testLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ClipboardList className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg text-on-surface">Take Assessment</h4>
                      <p className="text-sm text-on-surface-variant">Pass an AI-generated test (80% score required).</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-headline font-bold text-on-surface">Upload Certificate</h3>
                  <p className="text-on-surface-variant">Verify completion of: {milestone.title}</p>
                </div>

                <label className="block cursor-pointer">
                  <div className="bg-surface-container-low p-12 rounded-[2rem] border-2 border-dashed border-surface-container-high hover:border-primary/50 transition-all flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-headline font-bold text-on-surface">{selectedFile ? selectedFile.name : 'Select Certificate File'}</p>
                      <p className="text-sm text-on-surface-variant">PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                </label>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setMode('select')}
                    className="flex-1 py-4 rounded-full font-headline font-bold text-on-surface-variant bg-surface-container-high"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleVerifyCertificate}
                    disabled={!selectedFile || verifying}
                    className="flex-[2] bg-primary text-on-primary py-4 rounded-full font-headline font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {verifying ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'test' && currentTest && (
              <motion.div 
                key="test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-label text-xs font-bold text-secondary uppercase tracking-widest">Question {currentQuestionIdx + 1} of {currentTest.questions.length}</span>
                    <h3 className="text-xl font-headline font-bold text-on-surface">{currentTest.title}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-headline font-bold">
                    {currentQuestionIdx + 1}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-2xl font-headline font-bold text-on-surface leading-tight">{currentTest.questions[currentQuestionIdx].question}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {currentTest.questions[currentQuestionIdx].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(currentTest.questions[currentQuestionIdx].id, idx)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${answers[currentTest.questions[currentQuestionIdx].id] === idx ? 'bg-primary/5 border-primary shadow-md' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
                      >
                        <span className={`font-medium ${answers[currentTest.questions[currentQuestionIdx].id] === idx ? 'text-primary' : 'text-on-surface'}`}>{option}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentTest.questions[currentQuestionIdx].id] === idx ? 'bg-primary border-primary text-on-primary' : 'border-surface-container-highest'}`}>
                          {answers[currentTest.questions[currentQuestionIdx].id] === idx && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-surface-container-high">
                  <div className="h-1.5 flex-grow max-w-xs bg-surface-container-high rounded-full overflow-hidden mr-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIdx + 1) / currentTest.questions.length) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <button
                    disabled={answers[currentTest.questions[currentQuestionIdx].id] === undefined || verifying}
                    onClick={nextQuestion}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : currentQuestionIdx === currentTest.questions.length - 1 ? 'Finish' : 'Next'}
                    {!verifying && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'success' && (
              <motion.div 
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8 py-8"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                  <Trophy className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-headline font-extrabold text-on-surface">Verification <span className="text-primary">Success</span>!</h2>
                  <p className="text-on-surface-variant text-lg">Congratulations! You've successfully completed this milestone and earned <strong>{milestone.points} points</strong>.</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="bg-primary text-on-primary px-12 py-4 rounded-full font-headline font-bold text-lg shadow-xl shadow-primary/20"
                >
                  Great!
                </button>
              </motion.div>
            )}

            {mode === 'failure' && (
              <motion.div 
                key="failure"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8 py-8"
              >
                <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center text-error mx-auto">
                  <XCircle className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-headline font-extrabold text-on-surface">Verification <span className="text-error">Failed</span></h2>
                  <p className="text-on-surface-variant">{error}</p>
                </div>
                <div className="flex gap-4 max-w-xs mx-auto">
                  <button 
                    onClick={() => setMode('select')}
                    className="flex-1 py-4 rounded-full font-headline font-bold text-on-surface-variant bg-surface-container-high"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
