import { useEffect, useMemo, useState } from "react";
import styles from "@/features/notes/components/NotePanel.module.scss";
import { Button } from "@/features/common/Button/Button";

type NotePanelProps = {
  dayLabel: string;
  message: string | null; // null => loading, "" => no note yet
  onSave: (newMessage: string) => Promise<void>;
};

export const NotePanel = ({ dayLabel, message, onSave }: NotePanelProps) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const viewText = useMemo(() => {
    if (message === null) return "Loading...";
    if (message.trim().length === 0) return "No note for this day.";
    return message;
  }, [message]);

  useEffect(() => {
    // whenever a new day loads, reset editor state to reflect current message
    setMode("view");
    setDraft(message ?? "");
  }, [message]);

  const onClick = async () => {
    if (mode === "view") {
      setMode("edit");
      return;
    }

    setSaving(true);
    try {
      await onSave(draft.trim());
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.panel}>
      <h2>{dayLabel}</h2>

      {mode === "view" ? (
        <p>{viewText}</p>
      ) : (
        <textarea
          id="message"
          name="message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          disabled={saving}
        />
      )}

      <div>
        <Button
          onClick={() => void onClick()}
          disabled={saving || message === null}
        >
          {mode === "view" ? "Edit" : saving ? "Saving..." : "Save"}
        </Button>

        {mode === "edit" && (
          <Button
            type="button"
            onClick={() => {
              setMode("view");
              setDraft(message ?? "");
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
};
