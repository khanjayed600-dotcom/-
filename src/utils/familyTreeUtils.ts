import { FamilyMember, KinshipResult } from '../types/family';

export function createMemberMap(members: FamilyMember[]): Map<string, FamilyMember> {
  const map = new Map<string, FamilyMember>();
  members.forEach((m) => map.set(m.id, m));
  return map;
}

export function getAncestors(memberId: string, memberMap: Map<string, FamilyMember>): FamilyMember[] {
  const ancestors: FamilyMember[] = [];
  let current = memberMap.get(memberId);
  while (current && current.parentId) {
    const parent = memberMap.get(current.parentId);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  return ancestors;
}

export function getPathToRoot(memberId: string, memberMap: Map<string, FamilyMember>): FamilyMember[] {
  const path: FamilyMember[] = [];
  let current = memberMap.get(memberId);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = memberMap.get(current.parentId);
  }
  return path;
}

export function getDescendants(memberId: string, memberMap: Map<string, FamilyMember>): FamilyMember[] {
  const descendants: FamilyMember[] = [];
  const queue = [memberId];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const member = memberMap.get(currId);
    if (!member) continue;

    for (const childId of member.childrenIds) {
      const child = memberMap.get(childId);
      if (child) {
        descendants.push(child);
        queue.push(childId);
      }
    }
  }
  return descendants;
}

export function findCommonAncestor(
  idA: string,
  idB: string,
  memberMap: Map<string, FamilyMember>
): { commonAncestor?: FamilyMember; pathA: FamilyMember[]; pathB: FamilyMember[] } {
  const pathA = getPathToRoot(idA, memberMap);
  const pathB = getPathToRoot(idB, memberMap);

  let commonAncestor: FamilyMember | undefined;
  const setA = new Set(pathA.map((m) => m.id));

  for (let i = pathB.length - 1; i >= 0; i--) {
    if (setA.has(pathB[i].id)) {
      commonAncestor = pathB[i];
      break;
    }
  }

  return { commonAncestor, pathA, pathB };
}

export function calculateKinship(
  idA: string,
  idB: string,
  memberMap: Map<string, FamilyMember>
): KinshipResult | null {
  const memberA = memberMap.get(idA);
  const memberB = memberMap.get(idB);

  if (!memberA || !memberB) return null;

  if (idA === idB) {
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: 'একই ব্যক্তি',
      relationshipNameEn: 'Self',
      path: [memberA],
      description: `${memberA.name} এবং তিনি নিজে।`,
    };
  }

  // Check parent - child
  if (memberB.parentId === memberA.id) {
    const rel = memberB.gender === 'male' ? 'পুত্র (ছেলে)' : 'কন্যা (মেয়ে)';
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: rel,
      relationshipNameEn: memberB.gender === 'male' ? 'Son' : 'Daughter',
      commonAncestor: memberA,
      path: [memberA, memberB],
      description: `${memberB.name} হলেন ${memberA.name}-এর ${rel}।`,
    };
  }

  if (memberA.parentId === memberB.id) {
    const rel = memberB.gender === 'male' ? 'পিতা (বাবা)' : 'মাতা (মা)';
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: rel,
      relationshipNameEn: memberB.gender === 'male' ? 'Father' : 'Mother',
      commonAncestor: memberB,
      path: [memberA, memberB],
      description: `${memberB.name} হলেন ${memberA.name}-এর ${rel}।`,
    };
  }

  // Siblings
  if (memberA.parentId && memberA.parentId === memberB.parentId) {
    const rel = memberB.gender === 'male' ? 'ভাই' : 'বোন';
    const parent = memberMap.get(memberA.parentId);
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: `সহোদর ${rel}`,
      relationshipNameEn: memberB.gender === 'male' ? 'Brother' : 'Sister',
      commonAncestor: parent,
      path: [memberA, parent!, memberB],
      description: `${memberB.name} এবং ${memberA.name} সহোদর ${rel} (${parent ? parent.name + '-এর সন্তান' : ''})।`,
    };
  }

  // Ancestor / Descendant line
  const pathA = getPathToRoot(idA, memberMap);
  const pathB = getPathToRoot(idB, memberMap);

  const idxInB = pathB.findIndex((m) => m.id === idA);
  if (idxInB !== -1) {
    // A is ancestor of B
    const genDiff = memberB.generation - memberA.generation;
    let relBn = '';
    let relEn = '';
    if (genDiff === 1) {
      relBn = memberB.gender === 'male' ? 'পুত্র' : 'কন্যা';
      relEn = memberB.gender === 'male' ? 'Son' : 'Daughter';
    } else if (genDiff === 2) {
      relBn = memberB.gender === 'male' ? 'পৌত্র (নাতি)' : 'পৌত্রী (নাতনি)';
      relEn = memberB.gender === 'male' ? 'Grandson' : 'Granddaughter';
    } else if (genDiff === 3) {
      relBn = memberB.gender === 'male' ? 'প্রপৌত্র (পুতি)' : 'প্রপৌত্রী (পুতনি)';
      relEn = memberB.gender === 'male' ? 'Great-Grandson' : 'Great-Granddaughter';
    } else {
      relBn = `${genDiff}ম প্রজন্মের বংশধর (${memberB.gender === 'male' ? 'অধস্তন পুরুষ' : 'কন্যা'})`;
      relEn = `${genDiff}th Generation Descendant`;
    }
    const fullPath = pathB.slice(idxInB);
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: relBn,
      relationshipNameEn: relEn,
      commonAncestor: memberA,
      path: fullPath,
      description: `${memberB.name} হলেন ${memberA.name}-এর সরাসরি ${relBn} (${genDiff} প্রজন্ম ব্যবধান)।`,
    };
  }

  const idxInA = pathA.findIndex((m) => m.id === idB);
  if (idxInA !== -1) {
    // B is ancestor of A
    const genDiff = memberA.generation - memberB.generation;
    let relBn = '';
    let relEn = '';
    if (genDiff === 1) {
      relBn = 'পিতা (বাবা)';
      relEn = 'Father';
    } else if (genDiff === 2) {
      relBn = 'পিতামহ (দাদা)';
      relEn = 'Grandfather';
    } else if (genDiff === 3) {
      relBn = 'প্রপিতামহ (পরদাদা)';
      relEn = 'Great-Grandfather';
    } else {
      relBn = `${genDiff}ম ঊর্ধ্বতন পূর্বপুরুষ (আদিপুরুষ)`;
      relEn = `${genDiff}th Generation Ancestor`;
    }
    const fullPath = pathA.slice(idxInA).reverse();
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: relBn,
      relationshipNameEn: relEn,
      commonAncestor: memberB,
      path: fullPath,
      description: `${memberB.name} হলেন ${memberA.name}-এর ${relBn} (${genDiff} প্রজন্ম ঊর্ধ্বতন)।`,
    };
  }

  // Find Lowest Common Ancestor (LCA)
  const { commonAncestor } = findCommonAncestor(idA, idB, memberMap);
  if (!commonAncestor) {
    return {
      fromMember: memberA,
      toMember: memberB,
      relationshipNameBn: 'দূরবর্তী জ্ঞাতি',
      relationshipNameEn: 'Distant Relative',
      path: [memberA, memberB],
      description: `${memberA.name} এবং ${memberB.name} একই মোল্লা পরিবারের সদস্য।`,
    };
  }

  const distA = memberA.generation - commonAncestor.generation;
  const distB = memberB.generation - commonAncestor.generation;

  // Build connecting path: memberA -> commonAncestor -> memberB
  const subPathA: FamilyMember[] = [];
  let currA: FamilyMember | undefined = memberA;
  while (currA && currA.id !== commonAncestor.id) {
    subPathA.push(currA);
    currA = currA.parentId ? memberMap.get(currA.parentId) : undefined;
  }
  subPathA.push(commonAncestor);

  const subPathB: FamilyMember[] = [];
  let currB: FamilyMember | undefined = memberB;
  while (currB && currB.id !== commonAncestor.id) {
    subPathB.unshift(currB);
    currB = currB.parentId ? memberMap.get(currB.parentId) : undefined;
  }

  const fullPath = [...subPathA, ...subPathB];

  let relationshipBn = '';
  let relationshipEn = '';

  if (distA === 1 && distB === 2) {
    relationshipBn = memberB.gender === 'male' ? 'ভাতিজা' : 'ভাতিজি';
    relationshipEn = memberB.gender === 'male' ? 'Nephew' : 'Niece';
  } else if (distA === 2 && distB === 1) {
    relationshipBn = memberB.gender === 'male' ? 'চাচা' : 'ফুফু';
    relationshipEn = memberB.gender === 'male' ? 'Uncle' : 'Aunt';
  } else if (distA === 2 && distB === 2) {
    relationshipBn = memberB.gender === 'male' ? 'চাচাতো ভাই' : 'চাচাতো বোন';
    relationshipEn = 'First Cousin';
  } else if (distA === 2 && distB === 3) {
    relationshipBn = memberB.gender === 'male' ? 'চাচাতো ভাতিজা' : 'চাচাতো ভাতিজি';
    relationshipEn = 'First Cousin Once Removed (Junior)';
  } else if (distA === 3 && distB === 2) {
    relationshipBn = memberB.gender === 'male' ? 'চাচা (বাবার চাচাতো ভাই)' : 'ফুফু';
    relationshipEn = 'First Cousin Once Removed (Senior)';
  } else if (distA === 3 && distB === 3) {
    relationshipBn = memberB.gender === 'male' ? 'জ্ঞাতি ভাই (২য় চাচাতো ভাই)' : 'জ্ঞাতি বোন';
    relationshipEn = 'Second Cousin';
  } else {
    relationshipBn = `${commonAncestor.name}-এর বংশধর সূত্রে জ্ঞাতি আত্মীয়`;
    relationshipEn = 'Extended Family Relation';
  }

  return {
    fromMember: memberA,
    toMember: memberB,
    relationshipNameBn: relationshipBn,
    relationshipNameEn: relationshipEn,
    commonAncestor,
    path: fullPath,
    description: `${memberB.name} হলেন ${memberA.name}-এর ${relationshipBn}। উভয়ের সাধারণ পূর্বপুরুষ হলেন ${commonAncestor.name} (প্রজন্ম ${commonAncestor.generation})।`,
  };
}
