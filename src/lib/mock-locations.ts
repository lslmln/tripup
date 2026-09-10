export type Location = {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
};

// Lisbon-trip-relevant places for the poll location search, in the spirit of
// mock-candidates.ts/mock-trips.ts — static mock data, no backend.
export const mockLocations: Location[] = [
  { id: "l1", name: "Pastéis de Belém", subtitle: "Bakery", emoji: "🥐" },
  { id: "l2", name: "A Cevicheria", subtitle: "Restaurant", emoji: "🍽️" },
  { id: "l3", name: "Time Out Market", subtitle: "Food hall", emoji: "🍴" },
  { id: "l4", name: "LX Factory", subtitle: "Creative complex", emoji: "🎨" },
  { id: "l5", name: "Belém Tower", subtitle: "Landmark", emoji: "🗼" },
  { id: "l6", name: "Alfama Viewpoint", subtitle: "Miradouro", emoji: "🌅" },
  { id: "l7", name: "Praça do Comércio", subtitle: "Square", emoji: "🏛️" },
  { id: "l8", name: "Cervejaria Ramiro", subtitle: "Seafood restaurant", emoji: "🦐" },
  { id: "l9", name: "Jerónimos Monastery", subtitle: "Landmark", emoji: "⛪" },
  { id: "l10", name: "Park Bar", subtitle: "Rooftop bar", emoji: "🍹" },
];
