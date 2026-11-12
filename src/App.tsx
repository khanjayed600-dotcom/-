import React, { useState, useEffect, useMemo } from 'react';
import {
  GitFork,
  BookOpen,
  Users,
  Compass,
  BarChart3,
  Search,
  Sparkles,
  Download,
  RotateCcw,
  Printer,
  Heart,
  ChevronRight,
  Info,
} from 'lucide-react';
import { INITIAL_MEMBERS } from './data/familyData';
import { FamilyMember } from './types/family';
import { Header } from './components/Header';
import { FamilyTreeCanvas } from './components/FamilyTreeCanvas';
import { MemberProfileDrawer } from './components/MemberProfileDrawer';
import { KinshipFinderModal } from './components/KinshipFinderModal';
import { StoriesSection } from './components/StoriesSection';
import { BranchExplorer } from './components/BranchExplorer';
import { StatsSection } from './components/StatsSection';
import { AddMemberModal } from './components/AddMemberModal';

const STORAGE_KEY = 'molla_family_tree_members_v2';

export default function App() {
  // Members state with localStorage persistence
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: FamilyMember[] = JSON.parse(saved);
        // Verify Wajed Ali Molla has Afchunnahar as spouse
        const wajed = parsed.find((m) => m.id === 'wajed_ali_molla');
        if (wajed && (!wajed.spouse || wajed.spouse.name !== 'আফছুন্নাহার')) {
          return INITIAL_MEMBERS;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_MEMBERS;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'tree' | 'branches' | 'stories' | 'kinship' | 'stats'>('tree');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected member for profile drawer
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Path highlighting across the tree
  const [highlightedPathIds, setHighlightedPathIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [parentForNewChild, setParentForNewChild] = useState<FamilyMember | undefined>(undefined);
  const [isKinshipModalOpen, setIsKinshipModalOpen] = useState<boolean>(false);
  const [kinshipInitialIds, setKinshipInitialIds] = useState<{ from: string; to: string }>({
    from: 'zayed_ahmed',
    to: 'dhanaulla_molla',
  });

  // Save to localStorage whenever members change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      // ignore
    }
  }, [members]);

  // Lookup map
  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Add new member handler
  const handleAddMember = (newMember: FamilyMember) => {
    setMembers((prev) => {
      const updated = [...prev, newMember];
      // Update parent's childrenIds list
      if (newMember.parentId) {
        return updated.map((m) => {
          if (m.id === newMember.parentId) {
            return {
              ...m,
              childrenIds: Array.from(new Set([...m.childrenIds, newMember.id])),
            };
          }
          return m;
        });
      }
      return updated;
    });
  };

  // Save personal note to member
  const handleSaveMemberNote = (memberId: string, note: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newNote = m.historicalNote ? `${m.historicalNote} [স্মৃতি: ${note}]` : note;
          return { ...m, historicalNote: newNote };
        }
        return m;
      })
    );
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember((prev) => (prev ? { ...prev, historicalNote: prev.historicalNote ? `${prev.historicalNote} [স্মৃতি: ${note}]` : note } : null));
    }
  };

  // Reset data to initial historical record
  const handleResetData = () => {
    if (window.confirm('আপনি কি বংশলতিকা তথ্য প্রাথমিক ঐতিহাসিক রেকর্ডে ফিরিয়ে নিতে চান?')) {
      setMembers(INITIAL_MEMBERS);
      localStorage.removeItem(STORAGE_KEY);
      setHighlightedPathIds([]);
    }
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'molla_family_tree_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Print Tree Layout
  const handlePrint = () => {
    window.print();
  };

  // Open Kinship for specific member
  const handleOpenKinshipWith = (member: FamilyMember) => {
    setKinshipInitialIds({
      from: 'zayed_ahmed',
      to: member.id,
    });
    setIsKinshipModalOpen(true);
  };

  // Open Add Child modal for a parent
  const handleOpenAddChild = (parent: FamilyMember) => {
    setParentForNewChild(parent);
    setIsAddModalOpen(true);
  };

  const handleSelectMemberById = (id: string) => {
    const member = memberMap.get(id);
    if (member) {
      setSelectedMember(member);
      setActiveTab('tree');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setParentForNewChild(undefined);
          setIsAddModalOpen(true);
        }}
        onOpenKinship={() => setIsKinshipModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Notification Ribbon / Lineage Context */}
      <div className="bg-amber-900 text-amber-50 px-4 py-2 border-b border-amber-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-amber-950 text-amber-200 border border-amber-700/80 rounded shadow-xs">
              System Developer: JAYED
            </span>
            <span className="text-amber-700 hidden md:inline">|</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 hidden sm:inline" />
            <span className="font-serif-bn">
              <strong>ধনাউল্লা মোল্লা</strong> থেকে শুরু করে <strong>ইয়াদ মোল্লা</strong> পর্যন্ত ৭ প্রজন্মের সম্পূর্ণ ধারাবাহিক বংশধারা
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => {
                setActiveTab('tree');
                setHighlightedPathIds([
                  'dhanaulla_molla',
                  'torabuddin_molla',
                  'wajed_ali_molla',
                  'nazrul_islam',
                  'shamim_ahmed',
                  'zayed_ahmed',
                ]);
                const zayed = memberMap.get('zayed_ahmed');
                if (zayed) setSelectedMember(zayed);
              }}
              className="hover:underline flex items-center gap-1 text-amber-200 hover:text-white"
            >
              <span>জায়েদ আহমেদের বংশপথ দেখুন</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <span className="text-amber-700 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className="hover:underline text-amber-200 hover:text-white hidden sm:inline"
            >
              ফ্লোর ভিটের খামার ও কাচারি ঘরের ইতিহাস
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'tree' && (
          <FamilyTreeCanvas
            members={members}
            selectedMemberId={selectedMember?.id}
            onSelectMember={(m) => setSelectedMember(m)}
            highlightedPathIds={highlightedPathIds}
            searchQuery={searchQuery}
            onOpenStory={(m) => {
              setSelectedMember(m);
              setActiveTab('stories');
            }}
          />
        )}

        {activeTab === 'branches' && (
          <BranchExplorer
            members={members}
            onSelectMember={(m) => setSelectedMember(m)}
            onOpenKinshipWith={handleOpenKinshipWith}
          />
        )}

        {activeTab === 'stories' && (
          <StoriesSection
            onSelectMemberById={handleSelectMemberById}
            memberMap={memberMap}
          />
        )}

        {activeTab === 'stats' && (
          <StatsSection
            members={members}
            onSelectMemberById={handleSelectMemberById}
          />
        )}
      </main>

      {/* Member Details Drawer */}
      <MemberProfileDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        memberMap={memberMap}
        onSelectMember={(m) => setSelectedMember(m)}
        onOpenKinshipWith={handleOpenKinshipWith}
        onOpenAddChild={handleOpenAddChild}
        onSaveMemberNote={handleSaveMemberNote}
      />

      {/* Kinship Finder Modal */}
      <KinshipFinderModal
        isOpen={isKinshipModalOpen}
        onClose={() => setIsKinshipModalOpen(false)}
        members={members}
        initialFromMemberId={kinshipInitialIds.from}
        initialToMemberId={kinshipInitialIds.to}
        onHighlightPathInTree={(pathIds) => {
          setHighlightedPathIds(pathIds);
          setActiveTab('tree');
        }}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={members}
        initialParentId={parentForNewChild?.id}
        onAddMember={handleAddMember}
      />

      {/* Quiet Archival Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-serif-bn font-semibold text-stone-800">
              মোল্লা পরিবার বংশধারা ও স্মৃতি সংরক্ষণালয়
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              ধনাউল্লা মোল্লা · তোরাবদ্দীন মোল্লা · ওয়াজেদ আলী মোল্লা হতে ৭ম প্রজন্ম · <span className="font-mono font-medium text-amber-800">System Developer: JAYED</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              title="বংশলতিকা ডেটা ব্যাকআপ ডাউনলোড"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডেটা ডাউনলোড (JSON)</span>
            </button>

            <span className="text-stone-300">·</span>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 hover:text-stone-900 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>

            <span className="text-stone-300">·</span>

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1 text-stone-400 hover:text-rose-600 transition-colors"
              title="তথ্য পরিবর্তন বাতিল করে মূল বংশলতিকায় ফিরুন"
            >
              <RotateCcw className="w-3 h-3" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
