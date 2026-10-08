import { useState } from "react";
import { CalendarExample } from "minuta-react/components";
import { SegmentedDateInput } from "./SegmentedDateInput";

export default function App() {
  const [selected, setSelected] = useState<Date>();

  return (
    <main className="app-shell">
      <SegmentedDateInput date={selected} />
      {/* new Date() so re-picking the same day still resets the input */}
      <CalendarExample onSelectDate={(date) => setSelected(new Date(date))} />
    </main>
  );
}
