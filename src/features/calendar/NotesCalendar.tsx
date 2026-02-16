import { DayPicker, type Matcher } from "react-day-picker";
import { enGB } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import "@/features/calendar/NotesCalendar.scss";

type NotesCalendarProps = {
  selected: Date;
  onSelect: (d: Date) => void;
  hasNoteDates: Date[];
  fromDate: Date;
  toDate: Date;
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const NotesCalendar = ({
  selected,
  onSelect,
  hasNoteDates,
  fromDate,
  toDate,
}: NotesCalendarProps) => {
  const from = startOfDay(fromDate);
  const to = startOfDay(toDate);

  const hidden: Matcher[] = [{ before: from }, { after: to }];
  const disabled: Matcher[] = [{ before: from }, { after: to }];

  const isInRange = (d: Date) => {
    const x = startOfDay(d).getTime();
    return x >= from.getTime() && x <= to.getTime();
  };

  return (
    <div className="calendar-wrapper">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d) => {
          if (d && isInRange(d)) onSelect(d);
        }}
        hidden={hidden}
        disabled={disabled}
        locale={enGB}
        modifiers={{ hasNote: hasNoteDates }}
        modifiersClassNames={{ hasNote: "has-note" }}
      />
    </div>
  );
};
