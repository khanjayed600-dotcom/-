import React from 'react';
import { GitFork, BookOpen, Users, Compass, BarChart3, Plus, Search } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tree' | 'branches' | 'stories' | 'kinship' | 'stats';
  setActiveTab: (tab: 'tree' | 'branches' | 'stories' | 'kinship' | 'stats') => void;
  onOpenAddModal: () => void;
  onOpenKinship: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectSearchResult?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenKinship,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center font-serif-bn font-bold text-lg shadow-sm">
              ম
            </div>
            <div>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('tree');
                }}
                className="text-lg font-bold font-serif-bn tracking-tight text-stone-900 whitespace-nowrap block leading-tight hover:text-amber-800 transition-colors"
              >
                মোল্লা বংশধারা
              </a>
              <span className="text-[11px] text-stone-500 font-sans block leading-none">
                ধনাউল্লা মোল্লা স্মৃতি বংশলতিকা · ৭ প্রজন্ম
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'tree'
                  ? 'text-amber-800 border-amber-700 font-semibold'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              <GitFork className="w-4 h-4 text-amber-700" />
              <span>ইন্টারেক্টিভ ট্রি</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('branches')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'branches'
                  ? 'text-amber-800 border-amber-700 font-semibold'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>শাখা ও সদস্যবৃন্দ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'stories'
                  ? 'text-amber-800 border-amber-700 font-semibold'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>পারিবারিক ইতিবৃত্ত</span>
            </button>

            <button
              type="button"
              onClick={onOpenKinship}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'kinship'
                  ? 'text-amber-800 border-amber-700 font-semibold'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-700" />
              <span>সম্পর্ক নির্ণয়ক</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'stats'
                  ? 'text-amber-800 border-amber-700 font-semibold'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-700" />
              <span>পরিসংখ্যান</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick search input */}
            <div className="relative hidden lg:block w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-amber-800 hover:bg-amber-900 rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সদস্য যোগ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
