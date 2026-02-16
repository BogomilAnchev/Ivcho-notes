import { supabase } from "@/infrastructure/supabase/supabaseClient";

export type Patient = {
  id: string;
  day_date: string; // YYYY-MM-DD
  name: string;
  phone: string;
  email: string | null;
  operation_time: string | null; // "HH:MM:SS"
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientCreate = {
  day_date: string;
  name: string;
  phone: string;
  email?: string | null;
  operation_time?: string | null;
  comment?: string | null;
};

export type PatientUpdate = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  operation_time?: string | null;
  comment?: string | null;
};

const TABLE = "daily_patients";

export const patientsRepo = {
  async listByDay(dayDate: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        "id,day_date,name,phone,email,operation_time,comment,created_at,updated_at"
      )
      .eq("day_date", dayDate)
      .order("operation_time", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Patient[];
  },

  async getDaysWithAny(fromDate: string, toDate: string) {
    // minimal payload for dots; duplicates possible, we'll de-dupe on FE
    const { data, error } = await supabase
      .from(TABLE)
      .select("day_date")
      .gte("day_date", fromDate)
      .lte("day_date", toDate);

    if (error) throw error;
    return (data ?? []) as Array<{ day_date: string }>;
  },

  async create(payload: PatientCreate) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        day_date: payload.day_date,
        name: payload.name,
        phone: payload.phone,
        email: payload.email ?? null,
        operation_time: payload.operation_time ?? null,
        comment: payload.comment ?? null,
      })
      .select(
        "id,day_date,name,phone,email,operation_time,comment,created_at,updated_at"
      )
      .single();

    if (error) throw error;
    return data as Patient;
  },

  async update(payload: PatientUpdate) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        name: payload.name,
        phone: payload.phone,
        email: payload.email ?? null,
        operation_time: payload.operation_time ?? null,
        comment: payload.comment ?? null,
      })
      .eq("id", payload.id)
      .select(
        "id,day_date,name,phone,email,operation_time,comment,created_at,updated_at"
      )
      .single();

    if (error) throw error;
    return data as Patient;
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};
