"use client";

import { useState } from "react";
import { Plus, X, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <Button
          onClick={() => { setShowForm(true); setSelectedDay(null); }}
          style={{ backgroundColor: "#334035" }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo
        </Button>
      </div>

      {/* Formulário de novo encontro */}
      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Novo encontro</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <MeetingForm classes={classes} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Próximo encontro */}
      {nextMeeting && !showForm && (
        <Card className="border-l-4" style={{ borderLeftColor: "#7DAF9C" }}>
          <CardContent className="pt-4 pb-3">
            <button
              className="w-full flex items-center justify-between gap-3 text-left"
              onClick={() => setNextExpanded(e => !e)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#7DAF9C20" }}>
                  <Calendar className="w-4 h-4" style={{ color: "#7DAF9C" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Próximo encontro</p>
                  <p className="font-semibold truncate">{nextMeeting.theme ?? "Sem tema"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs">{nextMeeting.class_name}</Badge>
                {nextExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {nextExpanded && (
              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                {formatDate(nextMeeting.date)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendário */}
      <AgendaCalendar
        meetings={meetings}
        onDayClick={(date, dayMeetings) => setSelectedDay({ date, meetings: dayMeetings })}
      />

      {/* Popup de encontros do dia selecionado */}
      {selectedDay && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{formatDate(selectedDay.date)}</p>
              <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {selectedDay.meetings.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.theme ?? "Sem tema"}</p>
                    <p className="text-xs text-muted-foreground">{m.class_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {meetings.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#33403515" }}>
            <Calendar className="w-7 h-7" style={{ color: "#334035" }} />
          </div>
          <p className="font-semibold mb-1">Nenhum encontro agendado</p>
          <p className="text-sm text-muted-foreground mb-5">Crie o primeiro encontro para começar.</p>
          <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "#334035" }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo encontro
          </Button>
        </div>
      )}
    </div>
  );
}
