import React, { useState } from 'react';
import {
  X,
  Heart,
  Users,
  Compass,
  ArrowRight,
  BookOpen,
  Calendar,
  MapPin,
  Briefcase,
  User,
  Plus,
  Check,
} from 'lucide-react';
import { FamilyMember } from '../types/family';
import { getPathToRoot } from '../utils/familyTreeUtils';

interface MemberProfileDrawerProps {
  member: FamilyMember | null;
  onClose: () => void;
  memberMap: Map<string, FamilyMember>;
  onSelectMember: (member: FamilyMember) => void;
  onOpenKinshipWith: (member: FamilyMember) => void;
  onOpenAddChild: (parent: FamilyMember) => void;
  onSaveMemberNote?: (memberId: string, note: string) => void;
}

export const MemberProfileDrawer: React.FC<MemberProfileDrawerProps> = ({
  member,
  onClose,
  memberMap,
  onSelectMember,
  onOpenKinshipWith,
  onOpenAddChild,
  onSaveMemberNote,
}) => {
  if (!member) return null;

  const [personalMemory, setPersonalMemory] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Lineage path from root
  const lineagePath = getPathToRoot(member.id, memberMap);

  // Parent
  const parent = member.parentId ? memberMap.get(member.parentId) : null;

  // Children
  const children = member.childrenIds
    .map((id) => memberMap.get(id))
    .filter((c): c is FamilyMember => !!c);

  // Siblings
  const siblings = parent
    ? parent.childrenIds
        .filter((id) => id !== member.id)
        .map((id) => memberMap.get(id))
        .filter((s): s is FamilyMember => !!s)
    : [];

  const handleSaveNote = () => {
    if (onSaveMemberNote && personalMemory.trim()) {
      onSaveMemberNote(member.id, personalMemory);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const getBengaliNumeral = (num: number) => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭'];
    return digits[num] || num.toString();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-white border-l border-stone-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
            প্রজন্ম {getBengaliNumeral(member.generation)}
          </span>
          <span className="text-xs text-stone-500 font-sans">
            {member.branchName || 'মোল্লা বংশধারা'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Name & Title */}
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                member.gender === 'male'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif-bn text-stone-900 leading-tight">
                {member.name}
              </h2>
              {member.alias && (
                <p className="text-sm text-stone-600 font-medium">
                  ডাকনাম: {member.alias}
                </p>
              )}
              {member.englishName && (
                <p className="text-xs text-stone-400 font-sans tracking-wide">
                  {member.englishName}
                </p>
              )}
            </div>
          </div>

          {/* Quick Details */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
            <div>
              <span className="text-stone-400 block">লিঙ্গ:</span>
              <span className="font-medium">
                {member.gender === 'male' ? 'পুরুষ' : 'নারী'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">বংশক্রম:</span>
              <span className="font-medium">
                {getBengaliNumeral(member.generation)}ম প্রজন্ম
              </span>
            </div>
            {member.profession && (
              <div className="col-span-2">
                <span className="text-stone-400 block">পেশা ও পরিচিতি:</span>
                <span className="font-medium text-stone-800">
                  {member.profession}
                </span>
              </div>
            )}
            {member.location && (
              <div className="col-span-2">
                <span className="text-stone-400 block">কর্মক্ষেত্র / নিবাস:</span>
                <span className="font-medium text-stone-800">
                  {member.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Spouse Section */}
        {member.spouse && (
          <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>সহধর্মিণী / জীবনসঙ্গী</span>
            </div>
            <p className="text-base font-bold font-serif-bn text-stone-900">
              {member.spouse.name}
            </p>
            {member.spouse.englishName && (
              <p className="text-xs text-stone-500 font-sans">
                {member.spouse.englishName}
              </p>
            )}
            {member.spouse.note && (
              <p className="text-xs text-stone-600 mt-1">{member.spouse.note}</p>
            )}
          </div>
        )}

        {/* Historical Story / Notes */}
        {member.historicalNote && (
          <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1.5">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>পারিবারিক স্মৃতিগাথা ও তথ্য</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              {member.historicalNote}
            </p>
          </div>
        )}

        {/* Lineage Path to Root (Dhanaulla Molla) */}
        <div>
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            ধনাউল্লা মোল্লা হতে সরাসরি বংশধারা
          </h4>
          <div className="space-y-1.5">
            {lineagePath.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectMember(item)}
                className={`flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                  item.id === member.id
                    ? 'bg-amber-100/70 font-bold text-amber-950'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span className="text-[10px] text-stone-400 font-mono w-4">
                  {idx + 1}.
                </span>
                <span className="font-serif-bn">{item.name}</span>
                {item.alias && (
                  <span className="text-stone-400">({item.alias})</span>
                )}
                <span className="text-[10px] text-stone-400 ml-auto">
                  প্রজন্ম {getBengaliNumeral(item.generation)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Family Relatives: Parent, Children, Siblings */}
        <div className="space-y-4 pt-2 border-t border-stone-100">
          {parent && (
            <div>
              <span className="text-xs text-stone-400 block mb-1">পিতা / অভিভাবক:</span>
              <button
                type="button"
                onClick={() => onSelectMember(parent)}
                className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-serif-bn font-bold text-stone-800">
                  {parent.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          )}

          {/* Children List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">
                সন্তান-সন্ততি ({children.length} জন):
              </span>
              <button
                type="button"
                onClick={() => onOpenAddChild(member)}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>সন্তান যোগ</span>
              </button>
            </div>
            {children.length === 0 ? (
              <p className="text-xs text-stone-400 italic">কোনো সন্তানের তথ্য যুক্ত নেই</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => onSelectMember(child)}
                    className="text-left p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-serif-bn font-medium text-stone-800">
                        {child.name}
                      </span>
                      {child.alias && (
                        <span className="text-stone-500 ml-1">
                          ({child.alias})
                        </span>
                      )}
                      {child.spouse && (
                        <span className="text-[10px] text-rose-600 block">
                          ❤️ {child.spouse.name}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Siblings */}
          {siblings.length > 0 && (
            <div>
              <span className="text-xs text-stone-500 font-medium block mb-1.5">
                সহোদর ভাই ও বোন ({siblings.length} জন):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {siblings.map((sib) => (
                  <button
                    key={sib.id}
                    type="button"
                    onClick={() => onSelectMember(sib)}
                    className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                  >
                    {sib.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add personal memory / note */}
        <div className="pt-3 border-t border-stone-100">
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            ব্যক্তিগত স্মৃতি বা তথ্য লিপিবদ্ধ করুন:
          </label>
          <textarea
            rows={2}
            value={personalMemory}
            onChange={(e) => setPersonalMemory(e.target.value)}
            placeholder="যেমন: কর্মজীবন, শিক্ষাগত যোগ্যতা, স্মৃতি..."
            className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={!personalMemory.trim()}
              className="px-3 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-900 text-white rounded disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{isSaved ? 'সংরক্ষিত!' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Primary CTA */}
      <div className="p-4 border-t border-stone-200 bg-stone-50">
        <button
          type="button"
          onClick={() => onOpenKinshipWith(member)}
          className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>এই ব্যক্তির সাথে আত্মীয়তার সম্পর্ক নির্ণয় করুন</span>
        </button>
      </div>
    </div>
  );
};
