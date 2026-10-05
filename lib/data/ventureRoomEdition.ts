// The edition currently open for registration.
// Changing city/date/venue/price here updates every consumer.
export const CURRENT_EDITION = {
  slug: "abuja",
  city: "Abuja",
  heroCity: "ABUJA",
  heroDate: "24TH OCT",
  dateISO: "2026-10-24",
  dateLabel: "24 October 2026",
  timeLabel: "11:00am to 4:00pm WAT",
  timeShort: "11:00am WAT",
  venue: "Matambela Gardens",
  area: "Wuse 2, Abuja",
  fullVenue: "Matambela Gardens, Wuse 2, Abuja",
  mapsUrl: "https://maps.google.com/?q=Matambela+Gardens+Wuse+2+Abuja",
  priceNgn: 25000,
} as const;

export type EditionSlug = "lagos" | "abuja";