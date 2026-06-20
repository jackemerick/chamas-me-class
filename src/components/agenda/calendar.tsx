"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meeting {
  id: string;
  date: string;
  theme: string | null;
  class_name: string;
}

interface CalendarProps {
  meetings: Meeting[];
  onDayClick?: (date: string, meetings: Meeting[]) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function AgendaCalendar({ meetings, onDayClick }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Mapa de datas com encontros
  const meetingsByDate = meetings.reduce<Record<string, Meeting[]>>((acc, m) => {
    const d = m.date.split("T")[0];
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header do mês */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ backgroundColor: "#334035" }}>
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 md:h-14" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayMeetings = meetingsByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const hasMeeting = dayMeetings.length > 0;

          return (
            <button
              key={day}
              onClick={() => hasMeeting && onDayClick?.(dateStr, dayMeetings)}
              className={cn(
                "h-10 md:h-14 flex flex-col items-center justify-start pt-1.5 gap-0.5 text-sm transition-colors relative",
                hasMeeting ? "cursor-pointer hover:bg-muted/50" : "cursor-default",
                isToday && "font-bold"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs",
                  isToday && "text-white"
                )}
                style={isToday ? { backgroundColor: "#334035" } : undefined}
              >
                {day}
              </span>
              {hasMeeting && (
                <div className="flex gap-0.5">
                  {dayMeetings.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#F2542D" }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
