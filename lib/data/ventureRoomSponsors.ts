export type VentureRoomSponsor = {
    name: string;
    logoUrl: string;
    websiteUrl: string;
    category?: string;
    displayOrder: number;
  };
  
  // Add sponsors here as they're confirmed. Place logo files in /public/venture-room/sponsors/.
  export const VENTURE_ROOM_SPONSORS: VentureRoomSponsor[] = [
    // {
    //   name: "Pordware",
    //   logoUrl: "/venture-room/sponsors/pordware.png",
    //   websiteUrl: "https://pordware.org",
    //   category: "Venture Partner",
    //   displayOrder: 1,
    // },
  ];