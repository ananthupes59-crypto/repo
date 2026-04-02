import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, CheckCircle2, XCircle, ArrowRight, Loader2, Trophy, RefreshCw } from 'lucide-react';
import { MockTest as MockTestType, UserProfile } from '../types';
import { db, auth, collection, addDoc, Timestamp, updateDoc, doc, increment } from '../firebase';
import { generateMockTest } from '../services/gemini';

interface MockTestProps {
  userProfile: UserProfile;
  onUpdate: () => void;
}

export const MockTest: React.FC<MockTestProps> = ({ userProfile, onUpdate }) => {
  const [currentTest, setCurrentTest] = React.useState<MockTestType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [showResults, setShowResults] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startNewTest = async () => {
    setLoading(true);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setShowResults(false);
    setError(null);
    try {
      const testData = await generateMockTest(userProfile);
      if (!testData || !testData.questions || testData.questions.length === 0) {
        throw new Error("Failed to generate valid test questions.");
      }
      setCurrentTest({
        id: Math.random().toString(36).substr(2, 9),
        userId: auth.currentUser?.uid || '',
        timestamp: Timestamp.now(),
        ...testData
      } as MockTestType);
    } catch (err: any) {
      console.error('Error starting test:', err);
      setError(err.message || "Failed to generate mock test. Please try again.");
    } finally {
      setLoading(false);
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
    
    setSaving(true);
    let score = 0;
    currentTest.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });

    try {
      const testRef = await addDoc(collection(db, 'mock_tests'), {
        ...currentTest,
        score,
        completed: true,
        timestamp: Timestamp.now()
      });

      // Reward for completing a test
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        points: increment(score * 20), // 20 points per correct answer
        level: increment(score === currentTest.questions.length ? 1 : 0)
      });

      setShowResults(true);
      onUpdate();
    } catch (err: any) {
      console.error('Error saving test results:', err);
      setError("Failed to save test results. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-headline font-bold text-on-surface">Generating Your Mock Test</h3>
          <p className="text-on-surface-variant">Customizing questions based on your ambition: {userProfile.ambition}</p>
        </div>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-12 text-center space-y-8">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
          <ClipboardList className="w-10 h-10" />
        </div>
        <div className="space-y-4 max-w-lg mx-auto">
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">Ready for a <span className="text-primary">Mock Test</span>?</h2>
          <p className="text-on-surface-variant text-lg">Test your knowledge and earn points! Questions are tailored to your career goals.</p>
        </div>
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-xl font-label text-sm max-w-lg mx-auto">
            {error}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startNewTest}
          className="bg-primary text-on-primary px-10 py-4 rounded-full font-headline font-bold text-lg shadow-xl shadow-primary/20"
        >
          Start Assessment
        </motion.button>
      </div>
    );
  }

  if (showResults) {
    const score = Object.entries(answers).reduce((acc, [qId, ansIdx]) => {
      const q = currentTest.questions.find(q => q.id === qId);
      return q?.correctAnswer === ansIdx ? acc + 1 : acc;
    }, 0);

    return (
      <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-12 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto"
        >
          <Trophy className="w-12 h-12" />
        </motion.div>
        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">Test <span className="text-secondary">Completed</span>!</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Score</p>
              <p className="text-5xl font-headline font-extrabold text-primary">{score}/{currentTest.questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Points Earned</p>
              <p className="text-5xl font-headline font-extrabold text-secondary">+{score * 20}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startNewTest}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Another Test
          </motion.button>
          <button 
            onClick={() => setCurrentTest(null)}
            className="text-on-surface-variant font-label font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentTest.questions[currentQuestionIdx];

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="font-label text-xs font-bold text-secondary uppercase tracking-widest">Question {currentQuestionIdx + 1} of {currentTest.questions.length}</span>
          <h2 className="text-2xl font-headline font-bold text-on-surface">{currentTest.title}</h2>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-headline font-bold text-xl">
          {currentQuestionIdx + 1}
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-3xl font-headline font-bold text-on-surface leading-tight">{currentQuestion.question}</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ x: 10 }}
              onClick={() => handleAnswer(currentQuestion.id, idx)}
              className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${answers[currentQuestion.id] === idx ? 'bg-primary/5 border-primary shadow-lg' : 'bg-surface-container-low border-transparent hover:border-primary/20'}`}
            >
              <span className={`text-lg font-medium ${answers[currentQuestion.id] === idx ? 'text-primary' : 'text-on-surface'}`}>{option}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${answers[currentQuestion.id] === idx ? 'bg-primary border-primary text-on-primary' : 'border-surface-container-highest group-hover:border-primary/50'}`}>
                {answers[currentQuestion.id] === idx && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-surface-container-high">
        <div className="h-2 flex-grow max-w-xs bg-surface-container-high rounded-full overflow-hidden mr-8">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIdx + 1) / currentTest.questions.length) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={answers[currentQuestion.id] === undefined || saving}
          onClick={nextQuestion}
          className={`px-10 py-4 rounded-full font-headline font-bold flex items-center gap-2 shadow-lg transition-all ${answers[currentQuestion.id] === undefined ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary shadow-primary/20'}`}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : currentQuestionIdx === currentTest.questions.length - 1 ? 'Finish Test' : 'Next Question'}
          {!saving && <ArrowRight className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
};
