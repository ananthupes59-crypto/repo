import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { MarkSheetUpload } from '../components/MarkSheetUpload';
import { FileText } from 'lucide-react';
import Markdown from 'react-markdown';

export const AnalysisPage: React.FC = () => {
  const { latestAnalysis, generateGuidance } = useDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <MarkSheetUpload onAnalysisComplete={() => generateGuidance()} />
      {latestAnalysis && (
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/20 shadow-editorial">
          <h3 className="text-2xl font-headline font-bold text-primary mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-secondary" />
            Latest Analysis Result
          </h3>
          <div className="prose prose-emerald max-w-none">
            <div className="markdown-body text-on-surface-variant leading-relaxed">
              <Markdown>{latestAnalysis.analysisResult}</Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
