// src/types.ts

// Artwork we display in the UI
export type Artwork = {
  id: number;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  baseColorHex: string; // we keep this for info/debug, but we won't use it to build palettes anymore
};

// One palette swatch for the UI
export type PaletteColor = {
  hex: string; // e.g. "#24B1E0"
};

export type StudioMood = {
  id: string;
  createdAt: string;
  recordedFor?: string | null;
  artworkTitle: string;
  artistName: string;
  palette: PaletteColor[];
  note?: string;
};

export type DailyMoodEntry = {
  id: string;
  entryDate: string; // YYYY-MM-DD
  emoji: string;
  diary: string;
  palette: PaletteColor[];
  artworkTitle?: string;
};

// ---- External API response types ----

// Art Institute of Chicago API subset
export type ArtApiSingle = {
  id: number;
  title: string | null;
  artist_title: string | null;
  date_display: string | null;
  image_id: string | null;
  color?: {
    hex?: string;
  };
};

export type ArtApiResponse = {
  data: ArtApiSingle[];
};

// Colormind API response:
// Colormind returns { result: [[r,g,b],[r,g,b],...], ... }
// Only 'result' matters for us.
export type ColormindResponse = {
  result: [number, number, number][];
  // there may also be "model" or "palette", but we don't need them
};
