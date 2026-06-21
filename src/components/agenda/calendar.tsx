"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { getFeriadosBrasil } from "@/lib/feriados";

interface Meeting {
  id: string;
  date: string;
  theme: string | null;
  class_name: string;
  class_id: string;
  concluded: boolean;
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

  const meetingsByDate = meetings.reduce<Record<string, Meeting[]>>((acc, m) => {
    const d = m.date.split("T")[0];
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  const todayStr = today.toISOString().split("T")[0];
  const feriados = getFeriadosBrasil(year);

  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, bgcolor: "#334035" }}>
        <IconButton onClick={prev} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
          {MONTHS[month]} {year}
        </Typography>
        <IconButton onClick={next} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Dias da semana */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid", borderColor: "divider" }}>
        {WEEKDAYS.map((d) => (
          <Box key={d} sx={{ py: 1, textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: 10, textTransform: "uppercase" }}>
              {d}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid de dias */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <Box key={`empty-${i}`} sx={{ height: 44 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayMeetings = meetingsByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const hasMeeting = dayMeetings.length > 0;
          const isFeriado = feriados.has(dateStr);

          return (
            <ButtonBase
              key={day}
              disabled={!hasMeeting}
              onClick={() => onDayClick?.(dateStr, dayMeetings)}
              sx={{
                height: 44,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                pt: 0.75,
                gap: 0.25,
                borderRadius: 1,
                cursor: hasMeeting ? "pointer" : "default",
                "&:hover": hasMeeting ? { bgcolor: "action.hover" } : {},
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  bgcolor: isToday ? "#334035" : "transparent",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isToday ? 700 : isFeriado ? 600 : 400,
                    color: isToday ? "white" : isFeriado ? "#F2542D" : "text.primary",
                    fontSize: 12,
                  }}
                >
                  {day}
                </Typography>
              </Box>
              {hasMeeting && (
                <Box sx={{ display: "flex", gap: 0.3 }}>
                  {dayMeetings.slice(0, 3).map((_, idx) => (
                    <Box key={idx} sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#F2542D" }} />
                  ))}
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
