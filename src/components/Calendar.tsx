"use client";

import { useState } from "react";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
}: {
  selected: Date;
  onSelect: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  const min = startOfDay(minDate);
  const max = startOfDay(maxDate);

  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)),
  ];

  const canGoPrev = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0) >= min;
  const canGoNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= max;

  return (
    <div className="rounded-lg border border-beige bg-white p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full text-brown disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-[14px] font-bold text-brown">
          {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => canGoNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          disabled={!canGoNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-brown disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className="flex h-7 items-center justify-center text-[11px] font-semibold text-soft-brown">
            {w}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const disabled = date < min || date > max;
          const isSelected = isSameDay(date, selected);
          return (
            <button
              type="button"
              key={date.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition ${
                isSelected
                  ? "bg-gold text-white"
                  : disabled
                    ? "text-soft-brown/40"
                    : "text-brown hover:bg-beige"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
