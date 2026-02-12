import { DayPicker, type Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "@/features/notes/components/NotesCalendar.scss";

type NotesCalendarProps = {
  selected: Date;
  onSelect: (d: Date) => void;
  hasNoteDates: Date[];
  fromDate: Date;
  toDate: Date;
};

export const NotesCalendar = ({
  selected,
  onSelect,
  hasNoteDates,
  fromDate,
  toDate,
}: NotesCalendarProps) => {
  const hidden: Matcher[] = [{ before: fromDate }, { after: toDate }];
  const disabled: Matcher[] = [{ before: fromDate }, { after: toDate }];

  return (
    <div className="calendar-wrapper">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d) => {
          if (d) onSelect(d);
        }}
        hidden={hidden}
        disabled={disabled}
        modifiers={{ hasNote: hasNoteDates }}
        modifiersClassNames={{ hasNote: "has-note" }}
      />
    </div>
  );
};
