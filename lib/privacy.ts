// The single place that decides what a friend is allowed to see.
//
// This function is the security boundary for the whole app: it OMITS keys
// entirely (rather than sending them as null/hidden) when a section hasn't
// been shared, so the private text never leaves the server in the first
// place. Callers must never send the raw Entry to a friend - only the
// output of this function.

export type PriorityItem = { done: boolean; text: string };

export type EntryForPrivacyFilter = {
  date: string;
  priorities: unknown;
  completed: unknown;
  pending: unknown;
  nextSteps: unknown;
  reflection: string;
  wentWell: string;
  challenges: string;
  gratitude: unknown;
  lifeForcePhysical: string;
  lifeForceHuman: string;
  lifeForceSelf: string;
  improve: string;
  shareReflection: boolean;
  shareGratitude: boolean;
  shareLifeForce: boolean;
  shareImprove: boolean;
};

// Mirrors the function's output: every field is optional because it's
// simply absent from the object when the owner hasn't shared it.
export type FriendVisibleEntry = {
  date: string;
  priorities?: PriorityItem[];
  completed?: string[];
  pending?: string[];
  nextSteps?: string[];
  reflection?: string;
  wentWell?: string;
  challenges?: string;
  gratitude?: string[];
  lifeForcePhysical?: string;
  lifeForceHuman?: string;
  lifeForceSelf?: string;
  improve?: string;
};

export function buildFriendVisibleEntry(entry: EntryForPrivacyFilter): FriendVisibleEntry {
  const visible: FriendVisibleEntry = {
    date: entry.date,
    // Sections 1, 2, 3, 5 - always visible to accepted friends
    priorities: entry.priorities as PriorityItem[],
    completed: entry.completed as string[],
    pending: entry.pending as string[],
    nextSteps: entry.nextSteps as string[],
  };

  // Sections 4, 6, 7, 8 - private by default, included only if the owner
  // has explicitly shared them for this entry.
  if (entry.shareReflection) {
    visible.reflection = entry.reflection;
    visible.wentWell = entry.wentWell;
    visible.challenges = entry.challenges;
  }
  if (entry.shareGratitude) {
    visible.gratitude = entry.gratitude as string[];
  }
  if (entry.shareLifeForce) {
    visible.lifeForcePhysical = entry.lifeForcePhysical;
    visible.lifeForceHuman = entry.lifeForceHuman;
    visible.lifeForceSelf = entry.lifeForceSelf;
  }
  if (entry.shareImprove) {
    visible.improve = entry.improve;
  }

  return visible;
}
