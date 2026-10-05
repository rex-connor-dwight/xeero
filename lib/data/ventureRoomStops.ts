export type StopStatus = "done" | "current" | "upcoming";

export type VentureRoomStop = {
  id: string;
  city: string;
  status: StopStatus;
  date?: string;
  venue?: string;
};

export const ventureRoomStops: VentureRoomStop[] = [
  { id: "lagos", city: "Lagos", status: "done", date: "26 Sep 2026", venue: "Bridge by Obsidian, Yaba" },
  { id: "abuja", city: "Abuja", status: "current", date: "24 Oct 2026", venue: "Matambela Gardens, Wuse 2" },
  { id: "more", city: "More cities", status: "upcoming" },
];