import styles from "@/features/notes/NotesPage.module.scss";
import { useEffect, useMemo, useState } from "react";
import { notesRepo } from "@/features/notes/data/notesRepo";
import { toISODate } from "@/features/notes/utils/date";
import { NotesCalendar } from "@/features/notes/components/NotesCalendar";
import { NotePanel } from "@/features/notes/components/NotePanel";
import { supabase } from "@/infrastructure/supabase/supabaseClient";
import { Button } from "@/features/common/Button/Button";

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

  const rangeFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - PAST_DAYS_TO_KEEP);
    return d;
  }, []);

  const rangeTo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + FUTURE_DAYS_TO_KEEP);
    return d;
  }, []);

  const hasNoteDates = useMemo(() => {
    return Array.from(notesByDate.entries())
      .filter(([, msg]) => msg.trim().length > 0)
      .map(([iso]) => new Date(`${iso}T00:00:00`));
  }, [notesByDate]);

  // Load notes for the allowed range on mount
  useEffect(() => {
    const run = async () => {
      setLoadingRange(true);
      try {
        const rows = await notesRepo.getRange(
          toISODate(rangeFrom),
          toISODate(rangeTo)
        );

        const map = new Map<string, string>();
        for (const r of rows) map.set(r.day_date, r.message ?? "");
        setNotesByDate(map);
      } finally {
        setLoadingRange(false);
      }
    };

    void run();
  }, [rangeFrom, rangeTo]);

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
    <main className={styles.page}>
      <header className={styles.page__header}>
        <h1>Team Notes</h1>

        <span>
          {loadingRange
            ? "Loading notes…"
            : `Showing last ${PAST_DAYS_TO_KEEP} days, future ${FUTURE_DAYS_TO_KEEP} days`}
        </span>

        <Button onClick={onLogout}>Logout</Button>
      </header>

      <div className={styles.page__main}>
        <NotesCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          hasNoteDates={hasNoteDates}
          fromDate={rangeFrom}
          toDate={rangeTo}
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
