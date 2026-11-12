import React, { useState, useMemo } from 'react';
import { X, Compass, ArrowRight, CheckCircle2, GitFork, User } from 'lucide-react';
import { FamilyMember } from '../types/family';
import { calculateKinship } from '../utils/familyTreeUtils';

interface KinshipFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialFromMemberId?: string;
  initialToMemberId?: string;
  onHighlightPathInTree: (pathIds: string[]) => void;
}

export const KinshipFinderModal: React.FC<KinshipFinderModalProps> = ({
  isOpen,
  onClose,
  members,
  initialFromMemberId = 'zayed_ahmed',
  initialToMemberId = 'dhanaulla_molla',
  onHighlightPathInTree,
}) => {
  if (!isOpen) return null;

  const [fromId, setFromId] = useState<string>(initialFromMemberId);
  const [toId, setToId] = useState<string>(initialToMemberId);

  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const kinship = useMemo(() => {
    if (!fromId || !toId) return null;
    return calculateKinship(fromId, toId, memberMap);
  }, [fromId, toId, memberMap]);

  const handleApplyToTree = () => {
    if (kinship && kinship.path.length > 0) {
      onHighlightPathInTree(kinship.path.map((m) => m.id));
      onClose();
    }
  };

  const getBengaliNumeral = (num: number) => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭'];
    return digits[num] || num.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif-bn text-stone-900 leading-tight">
                পারিবারিক সম্পর্ক ও আত্মীয়তা নির্ণয়ক
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                মোল্লা পরিবারের যেকোনো দুইজন সদস্যের পারস্পরিক রক্তের সম্পর্ক ও বংশানুক্রম বের করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Row */}
        <div className="p-5 border-b border-stone-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              ব্যক্তি ১ (সূচনাবিন্দু):
            </label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800 font-serif-bn"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.alias ? `(${m.alias})` : ''} · প্রজন্ম {m.generation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              ব্যক্তি ২ (গন্তব্য ব্যক্তি):
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-800 font-serif-bn"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.alias ? `(${m.alias})` : ''} · প্রজন্ম {m.generation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {kinship ? (
            <div className="space-y-4">
              {/* Primary Relationship Callout */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl text-center">
                <span className="text-xs uppercase tracking-wider text-amber-800 font-bold block mb-1">
                  পারস্পরিক আত্মীয়তা সম্পর্ক
                </span>
                <h4 className="text-2xl font-bold font-serif-bn text-amber-950 mb-1">
                  {kinship.relationshipNameBn}
                </h4>
                {kinship.relationshipNameEn && (
                  <p className="text-xs text-stone-500 font-sans mb-2">
                    ({kinship.relationshipNameEn})
                  </p>
                )}
                <p className="text-xs text-stone-700 max-w-lg mx-auto font-sans leading-relaxed">
                  {kinship.description}
                </p>
              </div>

              {/* Connecting Ancestral Path */}
              <div>
                <h5 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-amber-700" />
                  <span>বংশগত সংযোগের ধারাবাহিক স্তরসমূহ ({kinship.path.length} ধাপ)</span>
                </h5>
                <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {kinship.path.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-mono text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-serif-bn font-bold text-stone-900">
                            {item.name}
                          </span>
                          {item.alias && (
                            <span className="text-stone-500 text-[11px] ml-1">
                              ({item.alias})
                            </span>
                          )}
                          {item.spouse && (
                            <span className="text-rose-600 text-[11px] ml-2">
                              ❤️ {item.spouse.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-stone-500 font-sans">
                          প্রজন্ম {getBengaliNumeral(item.generation)}
                        </span>
                      </div>
                      {idx < kinship.path.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-stone-400 py-8">
              অনুগ্রহ করে দুইজন সদস্য নির্বাচন করুন।
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            বন্ধ করুন
          </button>
          <button
            type="button"
            onClick={handleApplyToTree}
            disabled={!kinship}
            className="px-4 py-2 text-xs font-medium text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>ট্রি ডায়াগ্রামে এই সম্পর্ক হাইলাইট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
