import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Filter,
  UserCheck,
  Info,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Move,
  Sliders,
  Layers,
  MousePointer2,
} from 'lucide-react';
import { FamilyMember } from '../types/family';
import { MemberCard } from './MemberCard';

interface FamilyTreeCanvasProps {
  members: FamilyMember[];
  selectedMemberId?: string;
  onSelectMember: (member: FamilyMember) => void;
  highlightedPathIds?: string[];
  searchQuery?: string;
  onOpenStory?: (member: FamilyMember) => void;
}

export const FamilyTreeCanvas: React.FC<FamilyTreeCanvasProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  highlightedPathIds = [],
  searchQuery = '',
  onOpenStory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // View style mode: 'canvas' (free pan/zoom) vs 'scroll' (native scrollable container)
  const [viewMode, setViewMode] = useState<'canvas' | 'scroll'>('canvas');

  // Canvas Pan & Zoom state
  const [scale, setScale] = useState<number>(0.85);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch gesture state for mobile pinch-to-zoom
  const touchStartDist = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse wheel preference: 'scroll' (normal page-like vertical scrolling) or 'zoom'
  const [wheelAction, setWheelAction] = useState<'scroll' | 'zoom'>('scroll');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());

  // Members map
  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Group members by generation for organized generational tiers
  const generations = useMemo(() => {
    const genGroups: { [key: number]: FamilyMember[] } = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    members.forEach((m) => {
      // Filter by branch if active
      if (selectedBranch !== 'all') {
        if (m.generation >= 4) {
          if (m.branchId !== selectedBranch && m.id !== 'root') {
            return;
          }
        }
      }
      if (genGroups[m.generation]) {
        genGroups[m.generation].push(m);
      }
    });

    return genGroups;
  }, [members, selectedBranch]);

  // Approximate vertical Y position offsets for generations in canvas mode
  const genYOffsets: { [key: number]: number } = {
    1: 40,
    2: -150,
    3: -380,
    4: -620,
    5: -980,
    6: -1450,
    7: -1900,
  };

  // Jump smoothly to a specific generation
  const jumpToGeneration = useCallback((genNum: number) => {
    if (viewMode === 'canvas') {
      const targetY = genYOffsets[genNum] ?? -500;
      setPosition({ x: 40, y: targetY });
    } else {
      const el = document.getElementById(`gen-section-${genNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [viewMode]);

  // Jump to top of tree
  const jumpToTop = useCallback(() => {
    jumpToGeneration(1);
  }, [jumpToGeneration]);

  // Jump to bottom of tree (Generation 7)
  const jumpToBottom = useCallback(() => {
    jumpToGeneration(7);
  }, [jumpToGeneration]);

  // Jump to Zayed Ahmed
  const jumpToZayed = useCallback(() => {
    const zayed = memberMap.get('zayed_ahmed');
    if (zayed) {
      onSelectMember(zayed);
      if (viewMode === 'canvas') {
        setScale(1.0);
        setPosition({ x: -180, y: -1350 });
      } else {
        const el = document.getElementById(`gen-section-6`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [memberMap, onSelectMember, viewMode]);

  // Fit all generations onto canvas
  const fitAll = useCallback(() => {
    setScale(0.48);
    setPosition({ x: 100, y: 20 });
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="button"]') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      touchStartDist.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist.current = Math.hypot(dx, dy);
      touchStartScale.current = scale;
      touchStartPos.current = { ...position };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / touchStartDist.current;
      const newScale = Math.max(0.3, Math.min(1.8, touchStartScale.current * ratio));
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  // Improved Mouse Wheel Handler:
  // If Ctrl/Cmd key is pressed OR wheelAction === 'zoom' -> Zoom In/Out
  // If Shift key is pressed -> Scroll horizontally
  // Otherwise -> Scroll VERTICALLY down/up smoothly! (This fixes the inability to scroll down)
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === 'scroll') return; // in native scroll mode, let browser scroll naturally

    e.preventDefault();

    if (e.ctrlKey || e.metaKey || wheelAction === 'zoom') {
      // Zoom
      const zoomFactor = 1.08;
      const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
      setScale(Math.max(0.3, Math.min(1.8, newScale)));
    } else if (e.shiftKey) {
      // Horizontal scroll
      setPosition((prev) => ({
        ...prev,
        x: prev.x - e.deltaY * 1.2,
      }));
    } else {
      // Standard vertical scroll (scrolling DOWN moves position Y UP so tree moves down)
      setPosition((prev) => ({
        ...prev,
        y: prev.y - e.deltaY * 1.2,
      }));
    }
  };

  // Zoom helpers
  const zoomIn = () => setScale((prev) => Math.min(1.8, Number((prev + 0.15).toFixed(2))));
  const zoomOut = () => setScale((prev) => Math.max(0.3, Number((prev - 0.15).toFixed(2))));
  const resetZoom = () => {
    setScale(0.85);
    setPosition({ x: 40, y: 30 });
  };

  const toggleBranchCollapse = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Check if member matches search query
  const matchesSearch = (member: FamilyMember) => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.alias && member.alias.toLowerCase().includes(q)) ||
      (member.englishName && member.englishName.toLowerCase().includes(q)) ||
      (member.spouse && member.spouse.name.toLowerCase().includes(q))
    );
  };

  // Generation titles & metadata
  const generationLabels: { [key: number]: { title: string; shortTitle: string; subtitle: string; era: string } } = {
    1: {
      title: '১ম প্রজন্ম · মূল আদিপুরুষ',
      shortTitle: '১ম: ধনাউল্লা মোল্লা',
      subtitle: 'ধনাউল্লা মোল্লা',
      era: 'বংশসূচনা',
    },
    2: {
      title: '২য় প্রজন্ম · পঞ্চপুত্র',
      shortTitle: '২য়: তোরাবদ্দীন ও ভ্রাতৃবৃন্দ',
      subtitle: 'তোরাবদ্দীন মোল্লা ও ভ্রাতৃবৃন্দ',
      era: 'পাঁচ ভাই ও মুরগীর খামার',
    },
    3: {
      title: '৩য় প্রজন্ম · বাণিজ্য বিস্তার',
      shortTitle: '৩য়: ওয়াজেদ আলী মোল্লা ❤️ আফছুন্নাহার',
      subtitle: 'ওয়াজেদ আলী মোল্লা ❤️ আফছুন্নাহার',
      era: 'কলকাতা, নারুয়া ও কাচারি ঘর',
    },
    4: {
      title: '৪র্থ প্রজন্ম · প্রধান পাঁচ পুত্র ও দুই কন্যা',
      shortTitle: '৪র্থ: পঞ্চপুত্র ও কন্যা',
      subtitle: 'ওয়াজেদ আলী মোল্লার ৫ পুত্র ও ২ কন্যা',
      era: 'বংশধারার বহুস্তরীয় বিকাশ',
    },
    5: {
      title: '৫ম প্রজন্ম · প্রপৌত্র ও প্রপৌত্রী',
      shortTitle: '৫ম: আরজু, শামীম, নয়ন প্রমুখ',
      subtitle: 'পরিবারের বিস্তার ও কর্মমুখর প্রজন্ম',
      era: 'আধুনিক কাল',
    },
    6: {
      title: '৬ষ্ঠ প্রজন্ম · সমসাময়িক বংশধর',
      shortTitle: '৬ষ্ঠ: জায়েদ, অন্ত, কাব্য প্রমুখ',
      subtitle: 'জায়েদ আহমেদ, অন্ত, কাব্য, সাভিয়া প্রমুখ',
      era: 'বর্তমান প্রজন্ম',
    },
    7: {
      title: '৭ম প্রজন্ম · কনিষ্ঠতম বংশধর',
      shortTitle: '৭ম: ইয়াদ মোল্লা (কনিষ্ঠতম)',
      subtitle: 'ইয়াদ মোল্লা (কনিষ্ঠতম উত্তরাধিকার)',
      era: 'ভবিষ্যতের আলো',
    },
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-stone-100 select-none">
      {/* Top Floating Control Bar */}
      <div className="z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left Controls: Branch & Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Canvas vs Native Scroll */}
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`px-2.5 py-1 text-xs font-serif-bn rounded-md transition-colors ${
                  viewMode === 'canvas'
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ক্যানভাস মোড (Pan & Zoom)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('scroll')}
                className={`px-2.5 py-1 text-xs font-serif-bn rounded-md transition-colors ${
                  viewMode === 'scroll'
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                স্ক্রল ভিউ (সহজ স্ক্রলিং)
              </button>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-xs bg-transparent font-serif-bn focus:outline-none text-stone-800 font-medium cursor-pointer"
              >
                <option value="all">সমগ্র বংশবৃক্ষ (সব শাখা)</option>
                <option value="nazrul">১ম: নজরুল ইসলাম শাখা</option>
                <option value="samsul">২য়: সামসুল আলম শাখা</option>
                <option value="mostafa">৩য়: আবু মোস্তফা শাখা</option>
                <option value="mohammad">৪র্থ: মোহাম্মদ আলী শাখা</option>
                <option value="ahammed">৫ম: আহাম্মেদ আলী শাখা</option>
              </select>
            </div>

            {/* Quick jump to Zayed Ahmed */}
            <button
              type="button"
              onClick={jumpToZayed}
              title="জায়েদ আহমেদের অবস্থানে ফোকাস করুন"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>জায়েদ আহমেদ</span>
            </button>
          </div>

          {/* Right Controls: Zoom, Wheel Mode, Top/Bottom Jump */}
          <div className="flex items-center gap-2">
            {viewMode === 'canvas' && (
              <>
                {/* Mouse Wheel Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setWheelAction((prev) => (prev === 'scroll' ? 'zoom' : 'scroll'))}
                  title={
                    wheelAction === 'scroll'
                      ? 'মাউস হুইল: স্ক্রল মোডে আছে (ক্লিক করে জুম মোডে নিন)'
                      : 'মাউস হুইল: জুম মোডে আছে (ক্লিক করে স্ক্রল মোডে নিন)'
                  }
                  className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-sans rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                >
                  <MousePointer2 className="w-3 h-3 text-stone-500" />
                  <span>হুইল: {wheelAction === 'scroll' ? 'স্ক্রল ↕️' : 'জুম 🔍'}</span>
                </button>

                {/* Zoom In / Out Controls */}
                <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={zoomOut}
                    title="জুম আউট"
                    className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-stone-700 font-mono w-11 text-center font-bold">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    title="জুম ইন"
                    className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={resetZoom}
                    title="রিসেট ভিউ"
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fit entire tree */}
                <button
                  type="button"
                  onClick={fitAll}
                  title="পুরো গাছ এক নজরে দেখুন"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>পুরো গাছ ফিট</span>
                </button>
              </>
            )}

            {/* Direct Jump to Bottom & Top */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={jumpToTop}
                title="গাছের শীর্ষে যান (১ম প্রজন্ম)"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif-bn font-medium bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg transition-colors"
              >
                <ArrowUp className="w-3 h-3 text-stone-600" />
                <span className="hidden sm:inline">শীর্ষে (১ম)</span>
              </button>
              <button
                type="button"
                onClick={jumpToBottom}
                title="গাছের একদম নিচে যান (৭ম প্রজন্ম: ইয়াদ মোল্লা)"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-serif-bn font-medium bg-amber-800 hover:bg-amber-900 text-white rounded-lg shadow-xs transition-colors"
              >
                <ArrowDown className="w-3 h-3 text-amber-200" />
                <span>নিচে (৭ম)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generation Quick-Jump Strip */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 text-[11px] scrollbar-none">
          <span className="text-stone-400 font-medium shrink-0">প্রজন্ম সরাসরি জাম্প:</span>
          {[1, 2, 3, 4, 5, 6, 7].map((gen) => (
            <button
              key={gen}
              type="button"
              onClick={() => jumpToGeneration(gen)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 font-serif-bn whitespace-nowrap transition-colors shrink-0"
            >
              {generationLabels[gen]?.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tree View: Canvas Mode OR Standard Scroll Mode */}
      {viewMode === 'canvas' ? (
        /* ================= CANVAS PAN & ZOOM MODE ================= */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`flex-1 w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden relative touch-none`}
        >
          {/* Subtle Archival Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `radial-gradient(#d6cebe 1px, transparent 1px)`,
              backgroundSize: `${32 * scale}px ${32 * scale}px`,
              backgroundPosition: `${position.x}px ${position.y}px`,
            }}
          />

          {/* Tree Content Group */}
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.12s ease-out',
            }}
            className="absolute top-0 left-0 p-12 min-w-[3400px]"
          >
            {/* Generational Rows Layout */}
            <div className="flex flex-col gap-16">
              {[1, 2, 3, 4, 5, 6, 7].map((genNum) => {
                const genMembers = generations[genNum] || [];
                if (genMembers.length === 0) return null;
                const meta = generationLabels[genNum];

                return (
                  <div key={genNum} id={`gen-canvas-${genNum}`} className="relative flex flex-col items-center">
                    {/* Generation Marker Header */}
                    <div className="flex items-center gap-3 mb-6 bg-white/95 backdrop-blur-sm border border-stone-200 px-4 py-1.5 rounded-full shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                      <span className="font-serif-bn font-bold text-sm text-stone-800">
                        {meta?.title}
                      </span>
                      <span className="text-xs text-stone-400">·</span>
                      <span className="text-xs text-stone-500 font-sans">
                        {meta?.era} ({genMembers.length} জন)
                      </span>
                    </div>

                    {/* Generation Cards Row */}
                    <div className="flex flex-wrap items-start justify-center gap-6 max-w-full">
                      {genMembers.map((member) => {
                        const isSelected = selectedMemberId === member.id;
                        const isHighlighted = matchesSearch(member);
                        const isInPath = highlightedPathIds.includes(member.id);
                        const isCurrentUser = member.id === 'zayed_ahmed';
                        const hasChildren = member.childrenIds.length > 0;
                        const isExpanded = !collapsedBranches.has(member.id);

                        return (
                          <div key={member.id} className="relative flex flex-col items-center">
                            <MemberCard
                              member={member}
                              isSelected={isSelected}
                              isHighlighted={isHighlighted}
                              isInPath={isInPath}
                              isCurrentUser={isCurrentUser}
                              hasChildren={hasChildren}
                              isExpanded={isExpanded}
                              onClick={() => onSelectMember(member)}
                              onStoryClick={(e) => {
                                e.stopPropagation();
                                onOpenStory?.(member);
                              }}
                              onToggleExpand={
                                hasChildren
                                  ? (e) => toggleBranchCollapse(member.id, e)
                                  : undefined
                              }
                            />

                            {/* Connector Line to next generation if has children */}
                            {hasChildren && isExpanded && (
                              <div className="w-0.5 h-6 bg-stone-300 mt-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Horizontal generational boundary line */}
                    <div className="w-full max-w-7xl h-px bg-stone-200/80 mt-12" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Navigation Aid Box on Bottom Right */}
          <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-stone-200 shadow-md">
            <button
              type="button"
              onClick={jumpToTop}
              title="গাছের শীর্ষে যান (১ম প্রজন্ম: ধনাউল্লা মোল্লা)"
              className="p-2 hover:bg-stone-100 text-stone-700 rounded-lg flex items-center gap-1.5 text-xs font-serif-bn transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">১ম প্রজন্ম</span>
            </button>
            <button
              type="button"
              onClick={jumpToZayed}
              title="জায়েদ আহমেদ (৬ষ্ঠ প্রজন্ম)"
              className="p-2 hover:bg-amber-50 text-amber-900 rounded-lg flex items-center gap-1.5 text-xs font-serif-bn transition-colors"
            >
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">জায়েদ</span>
            </button>
            <button
              type="button"
              onClick={jumpToBottom}
              title="গাছের একদম নিচে যান (৭ম প্রজন্ম: ইয়াদ মোল্লা)"
              className="p-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg flex items-center gap-1.5 text-xs font-serif-bn shadow-xs transition-colors"
            >
              <ArrowDown className="w-4 h-4 text-amber-200" />
              <span>৭ম প্রজন্ম (নিচে)</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= STANDARD SCROLL VIEW MODE ================= */
        <div
          ref={scrollContainerRef}
          className="flex-1 w-full h-full overflow-y-auto overflow-x-auto p-6 md:p-10 space-y-16"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((genNum) => {
            const genMembers = generations[genNum] || [];
            if (genMembers.length === 0) return null;
            const meta = generationLabels[genNum];

            return (
              <div
                key={genNum}
                id={`gen-section-${genNum}`}
                className="relative flex flex-col items-center max-w-7xl mx-auto scroll-mt-24"
              >
                {/* Generation Header */}
                <div className="flex items-center gap-3 mb-6 bg-white border border-stone-200 px-5 py-2 rounded-full shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                  <span className="font-serif-bn font-bold text-base text-stone-800">
                    {meta?.title}
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500 font-sans">
                    {meta?.era} ({genMembers.length} জন)
                  </span>
                </div>

                {/* Members in row */}
                <div className="flex flex-wrap items-start justify-center gap-6 w-full">
                  {genMembers.map((member) => {
                    const isSelected = selectedMemberId === member.id;
                    const isHighlighted = matchesSearch(member);
                    const isInPath = highlightedPathIds.includes(member.id);
                    const isCurrentUser = member.id === 'zayed_ahmed';
                    const hasChildren = member.childrenIds.length > 0;
                    const isExpanded = !collapsedBranches.has(member.id);

                    return (
                      <div key={member.id} className="relative flex flex-col items-center">
                        <MemberCard
                          member={member}
                          isSelected={isSelected}
                          isHighlighted={isHighlighted}
                          isInPath={isInPath}
                          isCurrentUser={isCurrentUser}
                          hasChildren={hasChildren}
                          isExpanded={isExpanded}
                          onClick={() => onSelectMember(member)}
                          onStoryClick={(e) => {
                            e.stopPropagation();
                            onOpenStory?.(member);
                          }}
                          onToggleExpand={
                            hasChildren
                              ? (e) => toggleBranchCollapse(member.id, e)
                              : undefined
                          }
                        />

                        {hasChildren && isExpanded && (
                          <div className="w-0.5 h-6 bg-stone-300 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-stone-200 mt-12" />
              </div>
            );
          })}

          {/* Bottom Floating Return Button */}
          <div className="flex justify-center pt-6 pb-12">
            <button
              type="button"
              onClick={jumpToTop}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-serif-bn shadow-sm transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              <span>গাছের একদম শীর্ষে ফিরে যান (১ম প্রজন্ম)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
