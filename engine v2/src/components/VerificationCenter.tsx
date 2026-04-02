import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Upload, CheckCircle2, XCircle, Loader2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { UserProfile, Analysis } from '../types';
import { db, auth, collection, addDoc, Timestamp, updateDoc, doc, increment, query, where, onSnapshot, orderBy } from '../firebase';
import { verifyDocument } from '../services/gemini';

interface VerificationCenterProps {
  userProfile: UserProfile;
  onUpdate: () => void;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({ userProfile, onUpdate }) => {
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifications, setVerifications] = React.useState<Analysis[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [docType, setDocType] = React.useState<'Mark Sheet' | 'Degree' | 'Certificate'>('Mark Sheet');

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVerifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Analysis)));
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile || !auth.currentUser) return;

    setVerifying(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result?.toString().split(',')[1];
          if (result) resolve(result);
          else reject(new Error('Failed to read file'));
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(selectedFile);
      });

      const result = await verifyDocument(base64, selectedFile.type, docType);
      
      await addDoc(collection(db, 'analyses'), {
        userId: auth.currentUser.uid,
        fileName: selectedFile.name,
        analysisResult: result.details,
        status: result.status,
        verificationDetails: result.details,
        timestamp: Timestamp.now()
      });

      if (result.status === 'verified') {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          points: increment(100), // 100 points for verified document
          level: increment(1)
        });
      }

      setSelectedFile(null);
      onUpdate();
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify document. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg p-8 lg:p-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Verification Center</span>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Verify Your <span className="text-primary">Credentials</span>
          </h2>
        </div>
        <div className="bg-primary/10 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Trust Level</p>
            <p className="text-2xl font-headline font-bold text-primary">Level {userProfile.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="space-y-8">
          <div className="bg-surface-container-low p-8 rounded-[2rem] border-2 border-dashed border-surface-container-high hover:border-primary/50 transition-all group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-headline font-bold text-on-surface">Upload New Document</h3>
                <div className="flex gap-2">
                  {(['Mark Sheet', 'Degree', 'Certificate'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${docType === type ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block cursor-pointer">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-headline font-bold text-on-surface">{selectedFile ? selectedFile.name : 'Click to select or drag & drop'}</p>
                    <p className="text-sm text-on-surface-variant">PDF, PNG, JPG (Max 5MB)</p>
                  </div>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
              </label>

              {selectedFile && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-headline font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying with AI...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Verify Document
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/10 flex items-start gap-4">
            <Info className="w-6 h-6 text-secondary shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-on-surface">Why verify?</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">Verified documents earn you 100 points and increase your Trust Level. This helps in getting better scholarship recommendations and interview calls.</p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-headline font-bold text-on-surface">Verification History</h3>
          <div className="space-y-4">
            <AnimatePresence>
              {verifications.length === 0 ? (
                <div className="text-center py-12 bg-surface-container-low rounded-[2rem] border border-surface-container-high">
                  <FileText className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                  <p className="text-on-surface-variant">No documents uploaded yet.</p>
                </div>
              ) : (
                verifications.map((v, idx) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-high flex items-center justify-between group hover:shadow-editorial transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${v.status === 'verified' ? 'bg-primary/10 text-primary' : v.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-on-surface truncate max-w-[150px]">{v.fileName}</p>
                        <p className="text-xs text-on-surface-variant uppercase font-label tracking-wider">{v.timestamp?.toDate ? new Date(v.timestamp.toDate()).toLocaleDateString() : 'Just now'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${v.status === 'verified' ? 'bg-primary/10 text-primary' : v.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {v.status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : v.status === 'rejected' ? <XCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                        {v.status || 'pending'}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
