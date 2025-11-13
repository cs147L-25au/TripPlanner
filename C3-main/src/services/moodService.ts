import { requireSupabaseClient } from "../lib/supabase";
import {
  DailyMoodEntry,
  PaletteColor,
  StudioMood,
} from "../types";

const STUDIO_TABLE = "studio_moods";
const DAILY_TABLE = "daily_moods";

type StudioRow = {
  id: string;
  created_at: string;
  artwork_title: string | null;
  artist_name: string | null;
  palette_hexes: string[] | null;
  note: string | null;
  recorded_for: string | null;
};

type DailyRow = {
  id: string;
  entry_date: string;
  emoji: string | null;
  diary: string | null;
  palette_hexes: string[] | null;
  artwork_title: string | null;
};

const mapStudioRow = (row: StudioRow): StudioMood => ({
  id: row.id,
  createdAt: row.created_at,
  recordedFor: row.recorded_for,
  artworkTitle: row.artwork_title ?? "Untitled",
  artistName: row.artist_name ?? "Unknown Artist",
  palette: (row.palette_hexes ?? []).map((hex) => ({ hex })),
  note: row.note ?? undefined,
});

const mapDailyRow = (row: DailyRow): DailyMoodEntry => ({
  id: row.id,
  entryDate: row.entry_date,
  emoji: row.emoji ?? "🙂",
  diary: row.diary ?? "",
  palette: (row.palette_hexes ?? []).map((hex) => ({ hex })),
  artworkTitle: row.artwork_title ?? undefined,
});

export async function fetchStudioMoods(): Promise<StudioMood[]> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from(STUDIO_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as StudioRow[]).map(mapStudioRow);
}

export async function saveMoodToStudio(payload: {
  artworkTitle: string;
  artistName: string;
  palette: PaletteColor[];
  recordedFor?: string | null;
  note?: string;
}): Promise<StudioMood> {
  const supabase = requireSupabaseClient();
  const insertPayload = {
    artwork_title: payload.artworkTitle,
    artist_name: payload.artistName,
    palette_hexes: payload.palette.map((p) => p.hex),
    note: payload.note ?? null,
    recorded_for: payload.recordedFor ?? null,
  };

  const { data, error } = await supabase
    .from(STUDIO_TABLE)
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapStudioRow(data as StudioRow);
}

export async function fetchDailyMoodsInRange(params: {
  startIso: string;
  endIso: string;
}): Promise<DailyMoodEntry[]> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .select("*")
    .gte("entry_date", params.startIso)
    .lte("entry_date", params.endIso)
    .order("entry_date", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as DailyRow[]).map(mapDailyRow);
}

export async function upsertDailyMood(payload: {
  entryDate: string;
  emoji: string;
  diary: string;
  palette: PaletteColor[];
  artworkTitle?: string;
}): Promise<DailyMoodEntry> {
  const supabase = requireSupabaseClient();
  const entryDateOnly = payload.entryDate.slice(0, 10);
  const upsertPayload = {
    entry_date: entryDateOnly,
    emoji: payload.emoji,
    diary: payload.diary,
    palette_hexes: payload.palette.map((p) => p.hex),
    artwork_title: payload.artworkTitle ?? null,
  };

  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .upsert(upsertPayload, { onConflict: "entry_date" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapDailyRow(data as DailyRow);
}
