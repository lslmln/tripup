export type Member = {
  id: string;
  name: string;
  isOrganiser?: boolean;
};

export const mockMembers: Member[] = [
  { id: "1", name: "Jessica" },
  { id: "2", name: "Becky", isOrganiser: true },
  { id: "3", name: "May" },
  { id: "4", name: "Nadia" },
  { id: "5", name: "Lexi" },
];
