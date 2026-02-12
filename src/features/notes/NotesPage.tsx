import { useEffect, useMemo, useState } from "react";
import { notesRepo } from "@/features/notes/data/notesRepo";
import { toISODate } from "@/features/notes/utils/date";
import { NotesCalendar } from "@/features/notes/components/NotesCalendar";
import { NotePanel } from "@/features/notes/components/NotePanel";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

const PAST_DAYS_TO_KEEP = 60;
const FUTURE_DAYS_TO_KEEP = 90;
export const NotesPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [notesByDate, setNotesByDate] = useState<Map<string, string>>(
    new Map()
  );
  const [loadingRange, setLoadingRange] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const selectedIso = useMemo(() => toISODate(selectedDate), [selectedDate]);

  const hasNoteDates = useMemo(() => {
    return Array.from(notesByDate.keys()).map(
      (iso) => new Date(`${iso}T00:00:00`)
    );
  }, [notesByDate]);

  // Load last 40 days notes on mount
  useEffect(() => {
    const run = async () => {
      setLoadingRange(true);
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - PAST_DAYS_TO_KEEP);
        to.setDate(from.getDate() + FUTURE_DAYS_TO_KEEP);

        const rows = await notesRepo.getRange(toISODate(from), toISODate(to));

        const map = new Map<string, string>();
        for (const r of rows) map.set(r.day_date, r.message ?? "");
        setNotesByDate(map);
      } finally {
        setLoadingRange(false);
      }
    };

    void run();
  }, []);

  // Load note for selected date (from cache first; fallback to DB)
  useEffect(() => {
    const run = async () => {
      const cached = notesByDate.get(selectedIso);
      if (cached !== undefined) {
        setSelectedMessage(cached);
        return;
      }

      setSelectedMessage(null);
      const row = await notesRepo.getByDate(selectedIso);
      const message = row?.message ?? "";
      setSelectedMessage(message);

      // cache it
      setNotesByDate((prev) => {
        const next = new Map(prev);
        next.set(selectedIso, message);
        return next;
      });
    };

    void run();
  }, [selectedIso, notesByDate]);

  const onSave = async (newMessage: string) => {
    const saved = await notesRepo.upsert(selectedIso, newMessage);

    setNotesByDate((prev) => {
      const next = new Map(prev);
      next.set(saved.day_date, saved.message ?? "");
      return next;
    });

    setSelectedMessage(saved.message ?? "");
  };

  const onLogout = () => {
    void supabase.auth.signOut();
  };

  return (
    <main style={{ maxWidth: 860, margin: "32px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>Team Notes</h1>
        <span style={{ opacity: 0.7 }}>
          {loadingRange
            ? "Loading notes…"
            : `Showing last ${PAST_DAYS_TO_KEEP}, future ${FUTURE_DAYS_TO_KEEP} days`}
        </span>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
          marginTop: 16,
        }}
      >
        <NotesCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          hasNoteDates={hasNoteDates}
        />

        <NotePanel
          dayLabel={selectedDate.toDateString()}
          message={selectedMessage}
          onSave={onSave}
        />
      </div>
    </main>
  );
};
