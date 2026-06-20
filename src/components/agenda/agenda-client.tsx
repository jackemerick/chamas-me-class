"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import { AgendaCalendar } from "./calendar";
import { MeetingForm } from "./meeting-form";

interface Meeting {
  id: string;
  date: string;
  theme: string | null;
  class_name: string;
}

interface ClassOption { id: string; name: string }

interface AgendaClientProps {
  meetings: Meeting[];
  nextMeeting: Meeting | null;
  classes: ClassOption[];
}

export function AgendaClient({ meetings, nextMeeting, classes }: AgendaClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: string; meetings: Meeting[] } | null>(null);
  const [nextExpanded, setNextExpanded] = useState(false);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long",
    });
  }

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Agenda</Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => { setShowForm(true); setSelectedDay(null); }}
        >
          Novo
        </Button>
      </Box>

      {/* Formulário */}
      {showForm && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Novo encontro</Typography>
              <IconButton size="small" onClick={() => setShowForm(false)}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <MeetingForm classes={classes} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Próximo encontro */}
      {nextMeeting && !showForm && (
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderLeft: "4px solid #7DAF9C", borderRadius: 3 }}
        >
          <CardContent sx={{ pb: "12px !important" }}>
            <Box
              component="button"
              onClick={() => setNextExpanded(e => !e)}
              sx={{ width: "100%", display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", p: 0, textAlign: "left" }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#7DAF9C18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#7DAF9C" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">Próximo encontro</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {nextMeeting.theme ?? "Sem tema"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <Chip label={nextMeeting.class_name} size="small" sx={{ fontSize: 11 }} />
                {nextExpanded ? <ExpandLessRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
              </Box>
            </Box>
            <Collapse in={nextExpanded}>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(nextMeeting.date)}
              </Typography>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Calendário */}
      <AgendaCalendar
        meetings={meetings}
        onDayClick={(date, dayMeetings) => setSelectedDay({ date, meetings: dayMeetings })}
      />

      {/* Popup do dia */}
      {selectedDay && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatDate(selectedDay.date)}</Typography>
              <IconButton size="small" onClick={() => setSelectedDay(null)}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
            <List disablePadding>
              {selectedDay.meetings.map((m, idx) => (
                <Box key={m.id}>
                  {idx > 0 && <Divider />}
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {m.theme ?? "Sem tema"}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">{m.class_name}</Typography>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {meetings.length === 0 && !showForm && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#33403514", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <CalendarMonthRoundedIcon sx={{ color: "primary.main", fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nenhum encontro agendado</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crie o primeiro encontro para começar.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setShowForm(true)}>
            Novo encontro
          </Button>
        </Box>
      )}
    </Box>
  );
}
