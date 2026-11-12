import React, { useMemo } from 'react';
import { BarChart3, Users, Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { FamilyMember } from '../types/family';

interface StatsSectionProps {
  members: FamilyMember[];
  onSelectMemberById: (id: string) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  members,
  onSelectMemberById,
}) => {
  const stats = useMemo(() => {
    let males = 0;
    let females = 0;
    let spousesCount = 0;
    const genCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    const branchCounts: { [key: string]: number } = {
      nazrul: 0,
      samsul: 0,
      mostafa: 0,
      mohammad: 0,
      ahammed: 0,
      other_brothers: 0,
      root: 0,
    };

    members.forEach((m) => {
      if (m.gender === 'male') males++;
      else females++;

      if (m.spouse) spousesCount++;

      genCounts[m.generation] = (genCounts[m.generation] || 0) + 1;

      if (m.branchId && branchCounts[m.branchId] !== undefined) {
        branchCounts[m.branchId]++;
      }
    });

    return {
      total: members.length,
      males,
      females,
      spousesCount,
      genCounts,
      branchCounts,
    };
  }, [members]);

  const getBengaliNumeral = (num: number) => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map((d) => digits[parseInt(d, 10)] || d)
      .join('');
  };

  const genNames: { [key: number]: string } = {
    1: '১ম প্রজন্ম · মূল আদিপুরুষ (ধনাউল্লা মোল্লা)',
    2: '২য় প্রজন্ম · তোরাবদ্দীন মোল্লা ও পঞ্চপুত্র',
    3: '৩য় প্রজন্ম · ওয়াজেদ আলী মোল্লা ও ভগিনী',
    4: '৪র্থ প্রজন্ম · প্রধান পাঁচ পুত্র ও দুই কন্যা',
    5: '৫ম প্রজন্ম · প্রপৌত্র ও প্রপৌত্রীগণ',
    6: '৬ষ্ঠ প্রজন্ম · বর্তমান সমসাময়িক বংশধরগণ',
    7: '৭ম প্রজন্ম · কনিষ্ঠতম সদস্য (ইয়াদ মোল্লা)',
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-sans block mb-1">
          বংশবৃত্তান্ত পরিসংখ্যান
        </span>
        <h2 className="text-3xl font-bold font-serif-bn text-stone-900 leading-tight">
          মোল্লা পরিবারের বংশবৃত্তান্ত ও জনতাত্ত্বিক চিত্র
        </h2>
        <p className="text-xs text-stone-500 max-w-lg mx-auto mt-2">
          ধনাউল্লা মোল্লা হতে ৭ প্রজন্ম পর্যন্ত মোট বংশলতিকার সুবিন্যস্ত সংখ্যাতত্ত্ব
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1 font-sans">মোট নথিভুক্ত সদস্য</span>
          <div className="text-3xl font-bold font-serif-bn text-stone-900 tabular-nums">
            {getBengaliNumeral(stats.total)} <span className="text-sm font-normal text-stone-500">জন</span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium mt-1 block">৭ প্রজন্মের ব্যাপ্তি</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1 font-sans">মোট পুরুষ সদস্য</span>
          <div className="text-3xl font-bold font-serif-bn text-sky-900 tabular-nums">
            {getBengaliNumeral(stats.males)} <span className="text-sm font-normal text-stone-500">জন</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">বংশধারার প্রত্যক্ষ পুরুষ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1 font-sans">মোট নারী সদস্য</span>
          <div className="text-3xl font-bold font-serif-bn text-rose-900 tabular-nums">
            {getBengaliNumeral(stats.females)} <span className="text-sm font-normal text-stone-500">জন</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">কন্যা ও বংশীয় নারী</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1 font-sans">নথিভুক্ত সহধর্মিণী/দম্পতি</span>
          <div className="text-3xl font-bold font-serif-bn text-amber-900 tabular-nums">
            {getBengaliNumeral(stats.spousesCount)} <span className="text-sm font-normal text-stone-500">জন</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">বিবাহবন্ধনে আবদ্ধ</span>
        </div>
      </div>

      {/* Generation Breakdown Chart & Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs mb-8">
        <h3 className="text-lg font-bold font-serif-bn text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-700" />
          <span>প্রজন্মভিত্তিক সদস্য বণ্টন (Generation Breakdown)</span>
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((gen) => {
            const count = stats.genCounts[gen] || 0;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={gen} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif-bn font-medium text-stone-800">
                    {genNames[gen]}
                  </span>
                  <span className="font-mono text-stone-600 tabular-nums">
                    {getBengaliNumeral(count)} জন ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      gen === 7
                        ? 'bg-amber-600'
                        : gen === 6
                        ? 'bg-emerald-600'
                        : gen === 5
                        ? 'bg-sky-600'
                        : 'bg-stone-700'
                    }`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Main Sons Branch Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h3 className="text-lg font-bold font-serif-bn text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-700" />
          <span>ওয়াজেদ আলী মোল্লার ৫ পুত্রের শাখাভিত্তিক বিস্তার</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">
              ১ম শাখা · নজরুল ইসলাম
            </span>
            <div className="text-2xl font-bold font-serif-bn text-stone-900 tabular-nums">
              {getBengaliNumeral(stats.branchCounts.nazrul || 0)} <span className="text-xs text-stone-500 font-normal">জন সদস্য</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">৩ ছেলে ও ২ মেয়ে · ৭ম প্রজন্ম পর্যন্ত বিস্তৃত</p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <span className="text-[11px] uppercase tracking-wider text-blue-800 font-bold block mb-1">
              ২য় শাখা · সামসুল আলম
            </span>
            <div className="text-2xl font-bold font-serif-bn text-stone-900 tabular-nums">
              {getBengaliNumeral(stats.branchCounts.samsul || 0)} <span className="text-xs text-stone-500 font-normal">জন সদস্য</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">৪ মেয়ে ও ১ ছেলে</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
            <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold block mb-1">
              ৩য় শাখা · আবু মোস্তফা
            </span>
            <div className="text-2xl font-bold font-serif-bn text-stone-900 tabular-nums">
              {getBengaliNumeral(stats.branchCounts.mostafa || 0)} <span className="text-xs text-stone-500 font-normal">জন সদস্য</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">২ ছেলে ও ২ মেয়ে</p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <span className="text-[11px] uppercase tracking-wider text-purple-800 font-bold block mb-1">
              ৪র্থ শাখা · মোহাম্মদ আলী
            </span>
            <div className="text-2xl font-bold font-serif-bn text-stone-900 tabular-nums">
              {getBengaliNumeral(stats.branchCounts.mohammad || 0)} <span className="text-xs text-stone-500 font-normal">জন সদস্য</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">২ ছেলে</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
            <span className="text-[11px] uppercase tracking-wider text-rose-800 font-bold block mb-1">
              ৫ম শাখা · আহাম্মেদ আলী
            </span>
            <div className="text-2xl font-bold font-serif-bn text-stone-900 tabular-nums">
              {getBengaliNumeral(stats.branchCounts.ahammed || 0)} <span className="text-xs text-stone-500 font-normal">জন সদস্য</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">২ মেয়ে</p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 font-bold block mb-1">
              কনিষ্ঠতম সদস্য
            </span>
            <div className="text-2xl font-bold font-serif-bn text-amber-900">
              ইয়াদ মোল্লা
            </div>
            <p className="text-xs text-stone-500 mt-1">৭ম প্রজন্ম · আকিব সেলিম অন্তের পুত্র</p>
          </div>
        </div>
      </div>
    </section>
  );
};
