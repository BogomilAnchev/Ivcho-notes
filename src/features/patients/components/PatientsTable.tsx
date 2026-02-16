import type { Patient } from "@/features/patients/data/patientsRepo";
import { Button } from "@/features/common/Button/Button";
import styles from "@/features/patients/components/PatientsTable.module.scss";

type PatientsTableProps = {
  patients: Patient[];
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
};

export const PatientsTable = ({
  patients,
  onEdit,
  onDelete,
}: PatientsTableProps) => {
  if (patients.length === 0) {
    return (
      <p className={styles["patients-table__empty"]}>No patients today.</p>
    );
  }

  return (
    <div className={styles["patients-table__scroll"]}>
      <table className={styles["patients-table__table"]}>
        <thead>
          <tr className={styles["patients-table__header-row"]}>
            <th className={styles["patients-table__header-cell"]}>Time</th>
            <th className={styles["patients-table__header-cell"]}>Name</th>
            <th className={styles["patients-table__header-cell"]}>Phone</th>
            <th className={styles["patients-table__header-cell"]}>Email</th>
            <th className={styles["patients-table__header-cell"]}>Comment</th>
            <th className={styles["patients-table__header-cell"]} />
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className={styles["patients-table__row"]}>
              <td className={styles["patients-table__cell"]}>
                {p.operation_time ? p.operation_time.slice(0, 5) : "—"}
              </td>

              <td className={styles["patients-table__cell"]}>{p.name}</td>

              <td className={styles["patients-table__cell"]}>
                <a
                  href={`tel:${p.phone}`}
                  className={styles["patients-table__phone-link"]}
                >
                  {p.phone}
                </a>
              </td>

              <td className={styles["patients-table__cell"]}>
                {p.email ?? "—"}
              </td>

              <td
                className={`${styles["patients-table__cell"]} ${styles["patients-table__cell--comment"]}`}
              >
                {p.comment ?? "—"}
              </td>

              <td
                className={`${styles["patients-table__cell"]} ${styles["patients-table__cell--actions"]}`}
              >
                <Button type="button" onClick={() => onEdit(p)}>
                  Edit
                </Button>

                <Button type="button" onClick={() => onDelete(p)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
