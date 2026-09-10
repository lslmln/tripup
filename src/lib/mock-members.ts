export type Member = {
  id: string;
  name: string;
  isOrganiser?: boolean;
  avatar: string;
};

// This prototype has no real auth — Ari is the one and only "logged in"
// user throughout the app (polls are created "as Ari", shown as "Me").
export const CURRENT_USER_ID = "1";

export const mockMembers: Member[] = [
  // Solo candid photo.
  { id: "1", name: "Ari", avatar: "https://i.pravatar.cc/150?img=16" },
  // Group selfie with friends.
  {
    id: "2",
    name: "Becky",
    isOrganiser: true,
    avatar:
      "https://images.unsplash.com/photo-1758272133786-ee98adcc6837?w=300&h=300&fit=crop&crop=faces&auto=format&q=80",
  },
  // With her partner, black and white.
  {
    id: "4",
    name: "Nic",
    avatar:
      "https://images.unsplash.com/photo-1745728947238-f901afdd3eb2?w=300&h=300&fit=crop&crop=faces&auto=format&q=80",
  },
  // Candid outdoor photo.
  {
    id: "5",
    name: "Lexi",
    avatar:
      "https://images.unsplash.com/photo-1500771181897-517651ae4eda?w=300&h=300&fit=crop&crop=faces&auto=format&q=80",
  },
];
