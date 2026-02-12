import { supabase } from "@/infrastructure/supabase/supabaseClient";

export type DailyNote = {
  day_date: string; // YYYY-MM-DD
  message: string;
  updated_at?: string;
};

const TABLE = "daily_notes";

export const notesRepo = {
  async getRange(fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("day_date,message,updated_at")
      .gte("day_date", fromDate)
      .lte("day_date", toDate)
      .order("day_date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as DailyNote[];
  },

  async getByDate(dayDate: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("day_date,message,updated_at")
      .eq("day_date", dayDate)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as DailyNote | null;
  },

  async upsert(dayDate: string, message: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ day_date: dayDate, message }, { onConflict: "day_date" })
      .select("day_date,message,updated_at")
      .single();

    if (error) throw error;
    return data as DailyNote;
  },
};
