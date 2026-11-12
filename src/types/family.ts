export type Gender = 'male' | 'female';

export interface Spouse {
  name: string;
  englishName?: string;
  note?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  englishName?: string;
  alias?: string; // ডাকনাম যেমন আরজু, অন্ত, নয়ন
  gender: Gender;
  generation: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  parentId?: string;
  spouse?: Spouse;
  childrenIds: string[];
  branchId?: 'root' | 'nazrul' | 'samsul' | 'mostafa' | 'mohammad' | 'ahammed' | 'other_brothers';
  branchName?: string;
  historicalNote?: string;
  profession?: string;
  location?: string;
  photoUrl?: string;
  isDirectDescendant?: boolean;
}

export interface FamilyStory {
  id: string;
  title: string;
  subtitle: string;
  relatedMemberIds: string[];
  era: string;
  tag: string;
  content: string;
  quote?: string;
}

export interface KinshipResult {
  fromMember: FamilyMember;
  toMember: FamilyMember;
  relationshipNameBn: string;
  relationshipNameEn: string;
  commonAncestor?: FamilyMember;
  path: FamilyMember[];
  description: string;
}
