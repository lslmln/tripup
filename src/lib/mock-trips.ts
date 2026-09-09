export type Trip = {
  id: string;
  name: string;
  dates: string;
  startDate: string;
  emoji: string;
  color: string;
  image: string;
};

// Deliberately not pre-sorted here — TripList.tsx does the sorting, so this
// also proves the sort logic (not array order) drives the displayed order.
export const mockTrips: Trip[] = [
  {
    id: "3",
    name: "NYC weekend",
    dates: "2 - 4 Jan '27",
    startDate: "2027-01-02",
    emoji: "🗽",
    color: "#4a6fa5",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/330px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
  },
  {
    id: "1",
    name: "Lisbon babes",
    dates: "5 - 10 Sep '27",
    startDate: "2027-09-05",
    emoji: "🌉",
    color: "#d97757",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/330px-Lisboa_-_Portugal_%2852597836992%29.jpg",
  },
  {
    id: "6",
    name: "Croatia sailing",
    dates: "3 - 10 Aug '27",
    startDate: "2027-08-03",
    emoji: "⛵",
    color: "#3d7fa6",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/330px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg",
  },
  {
    id: "2",
    name: "Bali crew",
    dates: "12 - 19 Oct '26",
    startDate: "2026-10-12",
    emoji: "🏖️",
    color: "#3b9e8f",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/TanahLot_2014.JPG/330px-TanahLot_2014.JPG",
  },
  {
    id: "4",
    name: "Tokyo squad",
    dates: "20 - 28 Mar '27",
    startDate: "2027-03-20",
    emoji: "🗼",
    color: "#c1548c",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tokyo_Tower_2023.jpg/330px-Tokyo_Tower_2023.jpg",
  },
  {
    id: "5",
    name: "Iceland road trip",
    dates: "8 - 15 Jun '27",
    startDate: "2027-06-08",
    emoji: "🌋",
    color: "#5b6b74",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg/330px-2008-05-24_35_Sk%C3%B3gafoss.jpg",
  },
];
