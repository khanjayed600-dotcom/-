import React from 'react';
import { BookOpen, Quote, Calendar, ArrowRight, User } from 'lucide-react';
import { HISTORICAL_STORIES } from '../data/familyData';
import { FamilyMember } from '../types/family';

interface StoriesSectionProps {
  onSelectMemberById: (id: string) => void;
  memberMap: Map<string, FamilyMember>;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  onSelectMemberById,
  memberMap,
}) => {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Editorial Title */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-sans block mb-2">
          পারিবারিক ঐতিহ্য ও স্মৃতিগাথা
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-serif-bn text-stone-900 tracking-tight mb-3">
          মোল্লা বংশের ঐতিহাসিক ইতিবৃত্ত
        </h2>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          ধনাউল্লা মোল্লার প্রাচীন ভিটা থেকে শুরু করে ওয়াজেদ আলী মোল্লার ব্যবসা ও আধুনিক ৭ম প্রজন্মের বিস্তৃতি পর্যন্ত সংগৃহীত পারিবারিক স্মৃতিকথা।
        </p>
      </div>

      {/* Stories Grid / Cards */}
      <div className="space-y-8">
        {HISTORICAL_STORIES.map((story, index) => (
          <article
            key={story.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Top metadata line */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pb-4 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-serif-bn font-bold text-xs">
                  {index + 1}
                </span>
                <span className="font-semibold text-amber-900">{story.tag}</span>
                <span aria-hidden="true">·</span>
                <span>{story.era}</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bn text-stone-900 mb-1 leading-snug">
              {story.title}
            </h3>
            <p className="text-xs text-stone-500 font-sans mb-4">
              {story.subtitle}
            </p>

            {/* Authentic Oral Quote */}
            {story.quote && (
              <blockquote className="my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 relative">
                <Quote className="w-5 h-5 text-amber-600/40 absolute top-2 right-3" />
                <p className="text-sm font-serif-bn italic text-amber-950 leading-relaxed">
                  "{story.quote}"
                </p>
                <footer className="text-[11px] text-amber-800/80 mt-1 font-sans">
                  — পারিবারিক মৌখিক বিবরণ ও প্রবীণদের স্মৃতিচারণ
                </footer>
              </blockquote>
            )}

            {/* Main Narrative Paragraph */}
            <p className="text-sm text-stone-700 leading-relaxed font-sans mb-6">
              {story.content}
            </p>

            {/* Related Members Badges / Jump Buttons */}
            {story.relatedMemberIds.length > 0 && (
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">
                  সম্পর্কিত সদস্য:
                </span>
                {story.relatedMemberIds.map((id) => {
                  const member = memberMap.get(id);
                  if (!member) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectMemberById(id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif-bn text-stone-700 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors"
                    >
                      <User className="w-3 h-3 text-stone-400" />
                      <span>{member.name}</span>
                      <ArrowRight className="w-3 h-3 text-stone-400" />
                    </button>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
