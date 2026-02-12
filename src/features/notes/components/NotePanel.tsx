import { useEffect, useMemo, useState } from "react";

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
    <section style={{ marginTop: 16 }}>
      <h2 style={{ marginBottom: 8 }}>{dayLabel}</h2>

      {mode === "view" ? (
        <p style={{ whiteSpace: "pre-wrap", minHeight: 60 }}>{viewText}</p>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          style={{ width: "100%", resize: "vertical" }}
          disabled={saving}
        />
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={() => void onClick()}
          disabled={saving || message === null}
        >
          {mode === "view" ? "Edit" : saving ? "Saving..." : "Save"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => {
              setMode("view");
              setDraft(message ?? "");
            }}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
};
