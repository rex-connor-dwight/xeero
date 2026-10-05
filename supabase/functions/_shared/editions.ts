export type EditionConfig = {
    slug: string;
    city: string;
    dateLabel: string;
    timeLabel: string;
    venue: string;
    area: string;
    priceNgn: number;
  };
  
  export const EDITIONS: Record<string, EditionConfig> = {
    lagos: {
      slug: "lagos",
      city: "Lagos",
      dateLabel: "26 September 2026",
      timeLabel: "11:00am WAT",
      venue: "Bridge by Obsidian",
      area: "Yaba, Lagos",
      priceNgn: 25000,
    },
    abuja: {
      slug: "abuja",
      city: "Abuja",
      dateLabel: "24 October 2026",
      timeLabel: "11:00am to 4:00pm WAT",
      venue: "Matambela Gardens",
      area: "Wuse 2, Abuja",
      priceNgn: 25000,
    },
  };
  
  // The edition open for registration. Change this one line when the next city opens
  // (and update lib/data/ventureRoomEdition.ts on the frontend to match).
  export const CURRENT_EDITION_SLUG = "abuja";
  export const CURRENT_EDITION = EDITIONS[CURRENT_EDITION_SLUG];
  
  // Rows created before editions existed are Lagos.
  export function getEdition(slug: string | null | undefined): EditionConfig {
    return EDITIONS[slug ?? "lagos"] ?? EDITIONS.lagos;
  }