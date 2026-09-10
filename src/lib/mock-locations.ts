export type Location = {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
};

// Lisbon-trip-relevant places for the poll location search, in the spirit of
// mock-candidates.ts/mock-trips.ts — static mock data, no backend. All food
// venues, since the poll this feeds is specifically about picking where to eat.
export const mockLocations: Location[] = [
  { id: "l1", name: "Pastéis de Belém", subtitle: "Bakery", emoji: "🥐" },
  { id: "l2", name: "A Cevicheria", subtitle: "Restaurant", emoji: "🍽️" },
  { id: "l3", name: "Time Out Market", subtitle: "Food hall", emoji: "🍴" },
  { id: "l4", name: "Manteigaria", subtitle: "Pastelaria", emoji: "🧁" },
  { id: "l5", name: "Taberna da Rua das Flores", subtitle: "Petisco tavern", emoji: "🍢" },
  { id: "l6", name: "Zambeze", subtitle: "Afro-Portuguese restaurant", emoji: "🍛" },
  { id: "l7", name: "Pistolas y Corazón", subtitle: "Taqueria", emoji: "🌮" },
  { id: "l8", name: "Cervejaria Ramiro", subtitle: "Seafood restaurant", emoji: "🦐" },
  { id: "l9", name: "Café de São Bento", subtitle: "Steakhouse", emoji: "🥩" },
  { id: "l10", name: "Park Bar", subtitle: "Rooftop bar", emoji: "🍹" },
];
