import React, { useState } from 'react';
import { X, UserPlus, Heart, Sparkles, Check } from 'lucide-react';
import { FamilyMember, Gender } from '../types/family';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialParentId?: string;
  onAddMember: (newMember: FamilyMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  initialParentId,
  onAddMember,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [parentId, setParentId] = useState<string>(
    initialParentId || (members[0] ? members[0].id : '')
  );
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseName, setSpouseName] = useState('');
  const [spouseEnglishName, setSpouseEnglishName] = useState('');
  const [historicalNote, setHistoricalNote] = useState('');
  const [profession, setProfession] = useState('');

  const selectedParent = members.find((m) => m.id === parentId);
  const calculatedGeneration = selectedParent ? (Math.min(7, selectedParent.generation + 1) as 1|2|3|4|5|6|7) : 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `member_${Date.now()}`;
    const newMember: FamilyMember = {
      id: newId,
      name: name.trim(),
      alias: alias.trim() || undefined,
      englishName: englishName.trim() || undefined,
      gender,
      generation: calculatedGeneration,
      parentId: parentId || undefined,
      childrenIds: [],
      branchId: selectedParent?.branchId || 'nazrul',
      branchName: selectedParent?.branchName,
      historicalNote: historicalNote.trim() || undefined,
      profession: profession.trim() || undefined,
      spouse: hasSpouse && spouseName.trim()
        ? {
            name: spouseName.trim(),
            englishName: spouseEnglishName.trim() || undefined,
          }
        : undefined,
      isDirectDescendant: true,
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif-bn text-stone-900 leading-tight">
                নতুন বংশধর বা সদস্য যুক্ত করুন
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                মোল্লা পরিবারের বংশলতিকায় নতুন সদস্যের তথ্য অন্তর্ভুক্তি
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Parent selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              পিতা / মাতা / অভিভাবক নির্বাচন করুন:
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 text-stone-900 font-serif-bn"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.alias ? `(${m.alias})` : ''} · প্রজন্ম {m.generation}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-amber-800 font-medium block mt-1">
              স্বয়ংক্রিয়ভাবে প্রজন্ম {calculatedGeneration} হিসেবে যুক্ত হবে
            </span>
          </div>

          {/* Name & Daknaam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                পূর্ণ নাম (বাংলায়) <span className="text-rose-600">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: আরমান মোল্লা"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ডাকনাম / পরিচিত নাম:
              </label>
              <input
                type="text"
                placeholder="যেমন: অন্ত, আরজু"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* English Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ইংরেজিতে নাম (ঐচ্ছিক):
              </label>
              <input
                type="text"
                placeholder="e.g. Arman Molla"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                লিঙ্গ:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${
                    gender === 'male'
                      ? 'bg-sky-50 border-sky-400 text-sky-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  পুরুষ
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${
                    gender === 'female'
                      ? 'bg-rose-50 border-rose-400 text-rose-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  নারী
                </button>
              </div>
            </div>
          </div>

          {/* Spouse Checkbox */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasSpouse}
                onChange={(e) => setHasSpouse(e.target.checked)}
                className="rounded text-amber-700 focus:ring-amber-600"
              />
              <span className="text-xs font-semibold text-stone-700">
                সহধর্মিণী / জীবনসঙ্গীর তথ্য যোগ করুন
              </span>
            </label>

            {hasSpouse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-rose-50/40 border border-rose-100 rounded-xl">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    জীবনসঙ্গীর নাম (বাংলায়):
                  </label>
                  <input
                    type="text"
                    placeholder="নাম লিখুন"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    ইংরেজিতে নাম:
                  </label>
                  <input
                    type="text"
                    placeholder="Spouse Name"
                    value={spouseEnglishName}
                    onChange={(e) => setSpouseEnglishName(e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes / Profession */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              পেশা বা পরিচিতি (ঐচ্ছিক):
            </label>
            <input
              type="text"
              placeholder="যেমন: ব্যবসা, শিক্ষকতা, প্রকৌশলী"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ঐতিহাসিক তথ্য বা স্মৃতিচারণ (ঐচ্ছিক):
            </label>
            <textarea
              rows={2}
              placeholder="এই সদস্য সম্পর্কে কোনো বিশেষ স্মৃতি বা তথ্য..."
              value={historicalNote}
              onChange={(e) => setHistoricalNote(e.target.value)}
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
