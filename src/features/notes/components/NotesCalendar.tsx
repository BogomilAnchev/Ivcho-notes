import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type NotesCalendarProps = {
  selected: Date;
  onSelect: (d: Date) => void;
  hasNoteDates: Date[];
};

export const NotesCalendar = ({
  selected,
  onSelect,
  hasNoteDates,
}: NotesCalendarProps) => {
  return (
    <div>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d) => {
          if (d) onSelect(d);
        }}
        modifiers={{ hasNote: hasNoteDates }}
        modifiersClassNames={{ hasNote: "has-note" }}
      />

      <style>{`
        .has-note > button {
          position: relative;
        }
        .has-note > button::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transform: translateX(-50%);
          background: currentColor;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};
