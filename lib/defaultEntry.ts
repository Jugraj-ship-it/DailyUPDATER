export type PriorityItem = { done: boolean; text: string };

export type EntryFormValues = {
  priorities: PriorityItem[];
  completed: string[];
  pending: string[];
  nextSteps: string[];
  reflection: string;
  wentWell: string;
  challenges: string;
  gratitude: string[];
  lifeForcePhysical: string;
  lifeForceHuman: string;
  lifeForceSelf: string;
  improve: string;
  shareReflection: boolean;
  shareGratitude: boolean;
  shareLifeForce: boolean;
  shareImprove: boolean;
};

export function defaultEntryValues(): EntryFormValues {
  return {
    priorities: [
      { done: false, text: "" },
      { done: false, text: "" },
      { done: false, text: "" },
    ],
    completed: ["", "", ""],
    pending: ["", ""],
    nextSteps: ["", ""],
    reflection: "",
    wentWell: "",
    challenges: "",
    gratitude: ["", ""],
    lifeForcePhysical: "",
    lifeForceHuman: "",
    lifeForceSelf: "",
    improve: "",
    shareReflection: false,
    shareGratitude: false,
    shareLifeForce: false,
    shareImprove: false,
  };
}
