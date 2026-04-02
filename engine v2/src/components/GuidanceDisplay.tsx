import React from 'react';
import Markdown from 'react-markdown';
import { Guidance } from '../types';
import { Compass, ExternalLink, BookOpen, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface GuidanceDisplayProps {
  guidance: Guidance | null;
  loading?: boolean;
}

export const GuidanceDisplay: React.FC<GuidanceDisplayProps> = ({ guidance, loading }) => {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest p-16 rounded-[2.5rem] shadow-editorial-lg flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Mapping Your Future</h3>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest">Pragati AI is analyzing Indian market trends...</p>
        </div>
      </div>
    );
  }

  if (!guidance) {
    return (
      <div className="bg-surface-container-lowest p-16 rounded-[2.5rem] shadow-editorial-lg text-center space-y-8">
        <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
          <Compass className="w-12 h-12 text-on-surface-variant opacity-20" />
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className="font-headline text-3xl font-bold text-on-surface">Your Roadmap Awaits</h3>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Complete your profile and upload a mark sheet to receive a high-precision career roadmap tailored to the Indian economy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest rounded-[2.5rem] shadow-editorial-lg overflow-hidden"
      >
        <div className="p-8 lg:p-12 border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-label text-secondary font-bold tracking-widest uppercase text-xs">Personalized Roadmap</span>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight flex items-center gap-4">
              <Compass className="w-10 h-10 text-primary" />
              Your Career <span className="text-primary">Path</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold font-label text-on-surface-variant bg-surface-container-low px-5 py-2 rounded-full uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Updated {new Date(guidance.timestamp?.toDate()).toLocaleDateString()}
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="prose prose-lg prose-primary max-w-none">
            <div className="markdown-body text-on-surface leading-relaxed space-y-6 font-body">
              <Markdown>{guidance.recommendations}</Markdown>
            </div>
          </div>

          {guidance.sources && guidance.sources.length > 0 && (
            <div className="mt-16 pt-10 border-t-2 border-surface-container-low">
              <h3 className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-secondary" />
                Verified Sources & Market Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guidance.sources.map((source: any, idx: number) => (
                  <a
                    key={idx}
                    href={source.web?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-surface-container-low hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20 transition-all group"
                  >
                    <span className="text-sm font-bold text-on-surface truncate group-hover:text-primary">
                      {source.web?.title || 'Research Source'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-on-surface-variant group-hover:text-primary flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: BookOpen, title: "What to Study", desc: "Personalized degrees, certifications, and skill-building paths.", color: "primary" },
          { icon: MapPin, title: "Where to Study", desc: "Top Indian institutions and local coaching centers near you.", color: "secondary" },
          { icon: TrendingUp, title: "Job Market", desc: "Real-time availability and salary trends in the Indian economy.", color: "tertiary" }
        ].map((item, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-editorial border-t-4 border-primary transition-transform hover:-translate-y-2">
            <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6`}>
              <item.icon className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-headline font-bold text-on-surface mb-3">{item.title}</h4>
            <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
