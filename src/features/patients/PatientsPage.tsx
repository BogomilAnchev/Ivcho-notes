import styles from "@/features/patients/PatientsPage.module.scss";
import { useEffect, useMemo, useState } from "react";
import { toISODate } from "@/features/patients/utils/date";
import { NotesCalendar } from "@/features/calendar/NotesCalendar";
import { supabase } from "@/infrastructure/supabase/supabaseClient";
import { Button } from "@/features/common/Button/Button";

import {
  patientsRepo,
  type Patient,
  type PatientCreate,
  type PatientUpdate,
} from "@/features/patients/data/patientsRepo";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { PatientsTable } from "@/features/patients/components/PatientsTable";

const PAST_DAYS_TO_KEEP = 60;
const FUTURE_DAYS_TO_KEEP = 90;

type PanelMode =
  | { kind: "view" }
  | { kind: "create" }
  | { kind: "edit"; patient: Patient };

export const NotesPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const [loadingRange, setLoadingRange] = useState(true);
  const [loadingDay, setLoadingDay] = useState(true);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [panelMode, setPanelMode] = useState<PanelMode>({ kind: "view" });

  // for calendar dots: day_date -> has at least 1 patient
  const [daysWithPatients, setDaysWithPatients] = useState<Set<string>>(
    () => new Set()
  );

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
    return Array.from(daysWithPatients.values()).map(
      (iso) => new Date(`${iso}T00:00:00`)
    );
  }, [daysWithPatients]);

  const refreshDots = async () => {
    const rows = await patientsRepo.getDaysWithAny(
      toISODate(rangeFrom),
      toISODate(rangeTo)
    );
    const set = new Set<string>();
    for (const r of rows) set.add(r.day_date);
    setDaysWithPatients(set);
  };

  const refreshDay = async (dayIso: string) => {
    const list = await patientsRepo.listByDay(dayIso);
    setPatients(list);
  };

  // Load dots for the allowed range on mount (and keep it refreshable)
  useEffect(() => {
    const run = async () => {
      setLoadingRange(true);
      try {
        await refreshDots();
      } finally {
        setLoadingRange(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeFrom, rangeTo]);

  // Load patients for selected date
  useEffect(() => {
    const run = async () => {
      setLoadingDay(true);
      try {
        await refreshDay(selectedIso);
        setPanelMode({ kind: "view" });
      } finally {
        setLoadingDay(false);
      }
    };

    void run();
  }, [selectedIso]);

  const onSubmitPatient = async (payload: PatientCreate | PatientUpdate) => {
    if ("id" in payload) {
      await patientsRepo.update(payload);
    } else {
      await patientsRepo.create(payload);
    }

    await refreshDay(selectedIso);
    await refreshDots();
    setPanelMode({ kind: "view" });
  };

  const onDeletePatient = (p: Patient) => {
    const ok = window.confirm(`Delete appointment for "${p.name}"?`);
    if (!ok) return;

    void (async () => {
      await patientsRepo.remove(p.id);
      await refreshDay(selectedIso);
      await refreshDots();
      setPanelMode({ kind: "view" });
    })();
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
            ? "Loading…"
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

        <section className={styles.page__info}>
          <h2 className={styles["page__info-title"]}>
            {selectedDate.toDateString()}
          </h2>

          {panelMode.kind === "view" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span>
                  {loadingDay
                    ? "Loading patients…"
                    : `${patients.length} appointments`}
                </span>
                <Button
                  type="button"
                  style={{ marginRight: "0" }}
                  onClick={() => setPanelMode({ kind: "create" })}
                >
                  Add new patient
                </Button>
              </div>

              {!loadingDay && (
                <PatientsTable
                  patients={patients}
                  onEdit={(p) => setPanelMode({ kind: "edit", patient: p })}
                  onDelete={onDeletePatient}
                />
              )}
            </>
          )}

          {panelMode.kind === "create" && (
            <PatientForm
              mode={{ kind: "create", dayDate: selectedIso }}
              onCancel={() => setPanelMode({ kind: "view" })}
              onSubmit={onSubmitPatient}
            />
          )}

          {panelMode.kind === "edit" && (
            <PatientForm
              mode={{ kind: "edit", patient: panelMode.patient }}
              onCancel={() => setPanelMode({ kind: "view" })}
              onSubmit={onSubmitPatient}
            />
          )}
        </section>
      </div>
    </main>
  );
};
