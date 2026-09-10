export type Location = {
  id: string;
  name: string;
  subtitle: string;
};

// Lisbon-trip-relevant places for the poll location search, in the spirit of
// mock-candidates.ts/mock-trips.ts — static mock data, no backend.
export const mockLocations: Location[] = [
  { id: "l1", name: "Pastéis de Belém", subtitle: "Bakery" },
  { id: "l2", name: "A Cevicheria", subtitle: "Restaurant" },
  { id: "l3", name: "Time Out Market", subtitle: "Food hall" },
  { id: "l4", name: "LX Factory", subtitle: "Creative complex" },
  { id: "l5", name: "Belém Tower", subtitle: "Landmark" },
  { id: "l6", name: "Alfama Viewpoint", subtitle: "Miradouro" },
  { id: "l7", name: "Praça do Comércio", subtitle: "Square" },
  { id: "l8", name: "Cervejaria Ramiro", subtitle: "Seafood restaurant" },
  { id: "l9", name: "Jerónimos Monastery", subtitle: "Landmark" },
  { id: "l10", name: "Park Bar", subtitle: "Rooftop bar" },
];
