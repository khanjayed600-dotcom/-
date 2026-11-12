import React from 'react';
import { Heart, BookOpen, ChevronRight, Sparkles, User } from 'lucide-react';
import { FamilyMember } from '../types/family';

interface MemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isInPath?: boolean;
  isCurrentUser?: boolean;
  onClick?: () => void;
  onStoryClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (e: React.MouseEvent) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected = false,
  isHighlighted = false,
  isInPath = false,
  isCurrentUser = false,
  onClick,
  onStoryClick,
  compact = false,
  hasChildren = false,
  isExpanded = true,
  onToggleExpand,
}) => {
  // Branch accent colors
  const getBranchBadgeColor = (branchId?: string) => {
    switch (branchId) {
      case 'nazrul':
        return 'border-emerald-300 bg-emerald-50/80 text-emerald-900';
      case 'samsul':
        return 'border-blue-300 bg-blue-50/80 text-blue-900';
      case 'mostafa':
        return 'border-amber-300 bg-amber-50/80 text-amber-900';
      case 'mohammad':
        return 'border-purple-300 bg-purple-50/80 text-purple-900';
      case 'ahammed':
        return 'border-rose-300 bg-rose-50/80 text-rose-900';
      case 'other_brothers':
        return 'border-stone-300 bg-stone-100/80 text-stone-700';
      default:
        return 'border-amber-300 bg-amber-50/80 text-amber-950';
    }
  };

  const getBorderState = () => {
    if (isSelected) return 'ring-2 ring-amber-600 border-amber-600 shadow-md scale-[1.02]';
    if (isInPath) return 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40 shadow-sm';
    if (isHighlighted) return 'ring-2 ring-amber-400 border-amber-500 bg-amber-50/60 shadow-sm animate-pulse';
    return 'border-stone-200 hover:border-amber-400 hover:shadow-md';
  };

  // Generation numeral in Bengali
  const getBengaliNumeral = (num: number) => {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭'];
    return digits[num] || num.toString();
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative text-left transition-all duration-200 cursor-pointer rounded-xl bg-white border ${getBorderState()} ${
        compact ? 'p-2.5 w-52' : 'p-3.5 w-64'
      }`}
    >
      {/* Top Header Row: Generation & Branch Tag */}
      <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 mb-1.5">
        <span className="font-serif-bn font-semibold text-stone-600">
          প্রজন্ম {getBengaliNumeral(member.generation)}
        </span>
        <div className="flex items-center gap-1">
          {member.historicalNote && (
            <button
              type="button"
              onClick={onStoryClick}
              title="ঐতিহাসিক তথ্য পড়ুন"
              className="p-0.5 rounded text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}
          {member.generation === 7 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 font-medium">
              <Sparkles className="w-3 h-3 text-amber-600" />
              কনিষ্ঠতম
            </span>
          )}
          {isCurrentUser && (
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded font-medium">
              আপনি
            </span>
          )}
        </div>
      </div>

      {/* Main Name & Alias */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-bold font-serif-bn text-stone-900 leading-snug">
            {member.name}
            {member.alias && (
              <span className="text-stone-500 font-normal ml-1 text-sm">
                ({member.alias})
              </span>
            )}
          </h4>
          {member.englishName && (
            <p className="text-[11px] text-stone-400 font-sans tracking-wide">
              {member.englishName}
            </p>
          )}
        </div>
        <div
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            member.gender === 'male' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
          }`}
          title={member.gender === 'male' ? 'পুরুষ' : 'নারী'}
        >
          <User className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Spouse Badge if married */}
      {member.spouse && (
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5 text-xs text-stone-700">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
          <span className="font-serif-bn font-medium truncate">
            {member.spouse.name}
          </span>
          {member.spouse.englishName && (
            <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">
              ({member.spouse.englishName})
            </span>
          )}
        </div>
      )}

      {/* Children count / expand control */}
      {hasChildren && onToggleExpand && (
        <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
          <span>{member.childrenIds.length} জন সন্তান</span>
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-0.5 text-amber-800 hover:text-amber-950 font-medium px-1.5 py-0.5 rounded hover:bg-stone-100 transition-colors"
          >
            <span>{isExpanded ? 'সংকুচিত' : 'প্রসারিত'}</span>
            <ChevronRight
              className={`w-3.5 h-3.5 transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};
