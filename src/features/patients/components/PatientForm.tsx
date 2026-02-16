import { useMemo, useState } from "react";
import type {
  Patient,
  PatientCreate,
  PatientUpdate,
} from "@/features/patients/data/patientsRepo";
import { Button } from "@/features/common/Button/Button";
import styles from "@/features/patients/components/PatientForm.module.scss";

type PatientFormMode =
  | { kind: "create"; dayDate: string }
  | { kind: "edit"; patient: Patient };

type PatientFormProps = {
  mode: PatientFormMode;
  onCancel: () => void;
  onSubmit: (payload: PatientCreate | PatientUpdate) => Promise<void>;
};

const normalizeTime = (value: string) => {
  const v = value.trim();
  if (v.length === 0) return null;
  return v.length === 5 ? `${v}:00` : v; // "HH:MM" -> "HH:MM:00"
};

export const PatientForm = ({ mode, onCancel, onSubmit }: PatientFormProps) => {
  const initial = useMemo(() => {
    if (mode.kind === "create") {
      return { name: "", phone: "", email: "", operationTime: "", comment: "" };
    }

    const p = mode.patient;
    return {
      name: p.name,
      phone: p.phone,
      email: p.email ?? "",
      operationTime: p.operation_time ? p.operation_time.slice(0, 5) : "",
      comment: p.comment ?? "",
    };
  }, [mode]);

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [operationTime, setOperationTime] = useState(initial.operationTime);
  const [comment, setComment] = useState(initial.comment);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 && phone.trim().length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setSubmitting(true);
    void (async () => {
      try {
        if (mode.kind === "create") {
          const payload: PatientCreate = {
            day_date: mode.dayDate,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim().length ? email.trim() : null,
            operation_time: normalizeTime(operationTime),
            comment: comment.trim().length ? comment.trim() : null,
          };

          await onSubmit(payload);
        } else {
          const payload: PatientUpdate = {
            id: mode.patient.id,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim().length ? email.trim() : null,
            operation_time: normalizeTime(operationTime),
            comment: comment.trim().length ? comment.trim() : null,
          };

          await onSubmit(payload);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save appointment."
        );
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <form className={styles["patient-form"]} onSubmit={handleSubmit}>
      <div className={styles["patient-form__field"]}>
        <label className={styles["patient-form__label"]}>
          <span>Name</span>
          <span className={styles["patient-form__required"]}>*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className={styles["patient-form__field"]}>
        <label className={styles["patient-form__label"]}>
          <span>Phone</span>
          <span className={styles["patient-form__required"]}>*</span>
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className={styles["patient-form__field"]}>
        <label className={styles["patient-form__label"]}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          type="email"
        />
      </div>

      <div className={styles["patient-form__field"]}>
        <label className={styles["patient-form__label"]}>
          Time of operation
        </label>
        <input
          value={operationTime}
          onChange={(e) => setOperationTime(e.target.value)}
          disabled={submitting}
          type="time"
        />
      </div>

      <div className={styles["patient-form__field"]}>
        <label className={styles["patient-form__label"]}>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          rows={10}
        />
      </div>

      {error && <div className={styles["patient-form__error"]}>{error}</div>}

      <div className={styles["patient-form__actions"]}>
        <Button type="submit" disabled={!canSubmit}>
          {mode.kind === "create"
            ? submitting
              ? "Adding..."
              : "Add appointment"
            : submitting
              ? "Saving..."
              : "Save"}
        </Button>

        <Button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
