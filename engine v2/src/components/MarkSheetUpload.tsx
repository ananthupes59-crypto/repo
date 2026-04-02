import React from 'react';
import { db, auth, collection, addDoc, Timestamp, OperationType, handleFirestoreError } from '../firebase';
import { analyzeMarkSheet } from '../services/gemini';
import { FileUp, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarkSheetUploadProps {
  onAnalysisComplete?: (result: string) => void;
}

export const MarkSheetUpload: React.FC<MarkSheetUploadProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;
    setAnalyzing(true);
    setError(null);
    try {
      const base64 = await toBase64(file);
      const result = await analyzeMarkSheet(base64, file.type);
      
      await addDoc(collection(db, 'analyses'), {
        userId: auth.currentUser.uid,
        fileName: file.name,
        analysisResult: result,
        timestamp: Timestamp.now(),
      });

      setSuccess(true);
      if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (err: any) {
      console.error("Error analyzing mark sheet:", err);
      setError('Failed to analyze mark sheet. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Academic Analyzer</span>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Analyze Your <br/><span className="text-primary">Mark Sheet</span>
          </h2>
        </div>
        <div className="hidden md:block">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <FileText className="w-8 h-8" />
          </div>
        </div>
      </div>

      <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
        Upload your latest mark sheet or certificate. Our AI will analyze your strengths and weaknesses to provide precision guidance.
      </p>

      <div className="relative group">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-500 ${file ? 'border-primary bg-primary/5' : 'border-surface-container-high bg-surface-container-low group-hover:border-primary/50 group-hover:bg-surface-container-lowest'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${file ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
            <FileUp className="w-10 h-10" />
          </div>
          <span className="text-on-surface font-headline text-xl font-bold text-center">
            {file ? file.name : 'Drop your mark sheet here'}
          </span>
          <span className="text-sm text-on-surface-variant mt-3 font-label uppercase tracking-wider">
            Supports JPG, PNG and PDF (Max 5MB)
          </span>
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
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 text-primary bg-primary/10 p-6 rounded-2xl border border-primary/20"
          >
            <CheckCircle className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium">Analysis complete! Your career roadmap has been updated with new insights.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={!file || analyzing}
          className="w-full md:w-auto px-12 py-5 rounded-full bg-primary text-on-primary font-headline font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:bg-surface-container-highest disabled:text-on-surface-variant shadow-xl shadow-primary/20"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing with Pragati AI...
            </>
          ) : (
            <>
              <FileUp className="w-6 h-6" />
              Analyze & Generate Insights
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
