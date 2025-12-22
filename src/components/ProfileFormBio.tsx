// Компонент для блока с вопросами анкеты (схлопывающиеся поля)
import { useState } from 'react';

interface BioQuestion {
  key: string;
  icon: string;
  question: string;
  placeholder: string;
}

interface BioSection {
  section: string;
  questions: BioQuestion[];
}

interface ProfileFormBioProps {
  aboutYouQuestions: BioQuestion[];
  opinionQuestions: BioSection[];
  bioPrompts: any;
  setBioPrompts: (prompts: any) => void;
  bioTab: 'about' | 'opinion';
  setBioTab: (tab: 'about' | 'opinion') => void;
  expandedQuestions: Set<string>;
  toggleQuestion: (key: string) => void;
  aboutYouFilledCount: number;
  opinionFilledCount: number;
  totalOpinionQuestions: number;
}

export function ProfileFormBio({
  aboutYouQuestions,
  opinionQuestions,
  bioPrompts,
  setBioPrompts,
  bioTab,
  setBioTab,
  expandedQuestions,
  toggleQuestion,
  aboutYouFilledCount,
  opinionFilledCount,
  totalOpinionQuestions,
}: ProfileFormBioProps) {
  return (
    <>
      {/* Tab Switcher */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBioTab('about')}
            className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
              bioTab === 'about'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            О Вас ({aboutYouFilledCount}/{aboutYouQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setBioTab('opinion')}
            className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
              bioTab === 'opinion'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Ваше мнение ({opinionFilledCount}/{totalOpinionQuestions})
          </button>
        </div>
      </div>

      {/* Tab: О Вас */}
      {bioTab === 'about' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
          <div className="space-y-4">
            {aboutYouQuestions.map((q) => {
              const isExpanded = expandedQuestions.has(q.key) || bioPrompts[q.key as keyof typeof bioPrompts]?.trim();
              
              return (
                <div key={q.key} className="group">
                  <button
                    type="button"
                    onClick={() => toggleQuestion(q.key)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      isExpanded 
                        ? 'bg-emerald-50 border-2 border-emerald-200' 
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-gray-800">
                      <span className="text-xl">{q.icon}</span>
                      <span className="flex-1">{q.question}</span>
                      {bioPrompts[q.key as keyof typeof bioPrompts]?.trim() && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      )}
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                      <textarea
                        value={bioPrompts[q.key as keyof typeof bioPrompts]}
                        onChange={(e) => setBioPrompts({ ...bioPrompts, [q.key]: e.target.value })}
                        placeholder={q.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Ваше мнение о... */}
      {bioTab === 'opinion' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
          {opinionQuestions.map((section, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h4 className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gray-300"></span>
                {section.section}
              </h4>
              <div className="space-y-4">
                {section.questions.map((q) => {
                  const isExpanded = expandedQuestions.has(q.key) || bioPrompts[q.key as keyof typeof bioPrompts]?.trim();
                  
                  return (
                    <div key={q.key} className="group">
                      <button
                        type="button"
                        onClick={() => toggleQuestion(q.key)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                          isExpanded 
                            ? 'bg-teal-50 border-2 border-teal-200' 
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <span className="flex items-start gap-2 text-gray-800">
                          <span className="text-lg mt-0.5">{q.icon}</span>
                          <span className="flex-1 text-sm leading-relaxed">{q.question}</span>
                          {bioPrompts[q.key as keyof typeof bioPrompts]?.trim() && (
                            <span className="w-2 h-2 bg-teal-500 rounded-full mt-1 flex-shrink-0"></span>
                          )}
                        </span>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                          <textarea
                            value={bioPrompts[q.key as keyof typeof bioPrompts]}
                            onChange={(e) => setBioPrompts({ ...bioPrompts, [q.key]: e.target.value })}
                            placeholder={q.placeholder}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
