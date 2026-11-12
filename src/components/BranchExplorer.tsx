import React, { useState, useMemo } from 'react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Heart,
  User,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { FamilyMember } from '../types/family';

interface BranchExplorerProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenKinshipWith: (member: FamilyMember) => void;
}

export const BranchExplorer: React.FC<BranchExplorerProps> = ({
  members,
  onSelectMember,
  onOpenKinshipWith,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['dhanaulla_molla', 'torabuddin_molla', 'wajed_ali_molla', 'nazrul_islam'])
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Main branch definitions
  const branches = [
    {
      id: 'all',
      title: 'সমগ্র বংশধারা',
      subtitle: 'সকল প্রজন্ম ও শাখা',
      count: members.length,
    },
    {
      id: 'nazrul',
      title: '১ম: নজরুল ইসলাম শাখা',
      subtitle: 'নজরুল ইসলাম ❤️ শীরিনা আক্তার (৩ ছেলে ২ মেয়ে)',
      leadId: 'nazrul_islam',
    },
    {
      id: 'samsul',
      title: '২য়: সামসুল আলম শাখা',
      subtitle: 'সামসুল আলম ❤️ শেফালী আলম (৪ মেয়ে ১ ছেলে)',
      leadId: 'samsul_alam',
    },
    {
      id: 'mostafa',
      title: '৩য়: আবু মোস্তফা শাখা',
      subtitle: 'আবু মোস্তফা ❤️ নারগিস (২ ছেলে ২ মেয়ে)',
      leadId: 'abu_mostafa',
    },
    {
      id: 'mohammad',
      title: '৪র্থ: মোহাম্মদ আলী শাখা',
      subtitle: 'মোহাম্মদ আলী ❤️ রওশনআরা (২ ছেলে)',
      leadId: 'mohammad_ali',
    },
    {
      id: 'ahammed',
      title: '৫ম: আহাম্মেদ আলী শাখা',
      subtitle: 'আহাম্মেদ আলী ❤️ রেনু (২ মেয়ে)',
      leadId: 'ahammed_ali',
    },
    {
      id: 'other_brothers',
      title: 'ধনাউল্লা মোল্লার অন্যান্য পুত্রগণ',
      subtitle: 'হারাণ, জোরাপ, তামেজ ও নিদান মোল্লা',
    },
  ];

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Branch filter
      if (activeBranchId !== 'all') {
        if (activeBranchId === 'other_brothers') {
          if (m.branchId !== 'other_brothers') return false;
        } else if (m.branchId !== activeBranchId && m.id !== 'dhanaulla_molla' && m.id !== 'torabuddin_molla' && m.id !== 'wajed_ali_molla') {
          return false;
        }
      }
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesAlias = m.alias?.toLowerCase().includes(q);
        const matchesSpouse = m.spouse?.name.toLowerCase().includes(q);
        const matchesEnglish = m.englishName?.toLowerCase().includes(q);
        return matchesName || matchesAlias || matchesSpouse || matchesEnglish;
      }
      return true;
    });
  }, [members, activeBranchId, search]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getBengaliNumeral = (num: number) => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭'];
    return digits[num] || num.toString();
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500 font-sans block mb-1">
            বংশতালিকা ও সদস্য সন্ধান
          </span>
          <h2 className="text-3xl font-bold font-serif-bn text-stone-900 leading-tight">
            শাখাভিত্তিক বিস্তারিত বংশলতিকা
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            মোট নথিভুক্ত সদস্য: <span className="font-bold text-stone-800 tabular-nums">{members.length} জন</span> · প্রজন্ম ১ থেকে ৭
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="নাম বা ডাকনাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900"
          />
        </div>
      </div>

      {/* Branch Tabs (Segmented Controls) */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-stone-100 rounded-xl">
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveBranchId(b.id)}
            className={`px-3.5 py-1.5 text-xs font-serif-bn rounded-lg transition-colors whitespace-nowrap ${
              activeBranchId === b.id
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {/* Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectMember(member)}
            className="bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Generation & Branch */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                <span className="font-serif-bn font-semibold text-stone-700">
                  প্রজন্ম {getBengaliNumeral(member.generation)}
                </span>
                {member.generation === 7 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    ৭ম প্রজন্ম
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 truncate max-w-[120px]">
                    {member.branchName?.split(':')[1] || member.branchName}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold font-serif-bn text-stone-900 leading-snug">
                  {member.name}
                  {member.alias && (
                    <span className="text-stone-500 text-sm ml-1">
                      ({member.alias})
                    </span>
                  )}
                </h3>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    member.gender === 'male'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <User className="w-3 h-3" />
                </span>
              </div>

              {/* Spouse */}
              {member.spouse && (
                <div className="mt-2 text-xs flex items-center gap-1.5 text-stone-600">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                  <span className="font-serif-bn">{member.spouse.name}</span>
                </div>
              )}

              {/* Historical Note Excerpt if present */}
              {member.historicalNote && (
                <p className="mt-2 text-[11px] text-stone-500 font-sans line-clamp-2">
                  {member.historicalNote}
                </p>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>{member.childrenIds.length} সন্তান</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenKinshipWith(member);
                }}
                className="text-amber-800 hover:text-amber-950 font-medium"
              >
                সম্পর্ক দেখুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
