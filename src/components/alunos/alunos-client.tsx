"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

interface Student {
  id: string;
  name: string;
  birthdate: string | null;
  city: string | null;
  class_id: string;
  class_name: string;
  age: number | null;
}

interface ClassOption {
  id: string;
  name: string;
}

interface AlunosClientProps {
  students: Student[];
  classes: ClassOption[];
}

const AGE_RANGES = [
  { label: "Todas as idades", min: null, max: null },
  { label: "Até 6 anos", min: null, max: 6 },
  { label: "7 a 11 anos (Juniores)", min: 7, max: 11 },
  { label: "12 a 17 anos (Adolescentes)", min: 12, max: 17 },
  { label: "18+ anos", min: 18, max: null },
];

export function AlunosClient({ students, classes }: AlunosClientProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState(0); // índice em AGE_RANGES

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const range = AGE_RANGES[ageFilter];
    return students.filter(s => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (classFilter !== "all" && s.class_id !== classFilter) return false;
      if (range.min !== null && (s.age === null || s.age < range.min)) return false;
      if (range.max !== null && (s.age === null || s.age > range.max)) return false;
      return true;
    });
  }, [students, search, classFilter, ageFilter]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Alunos</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {filtered.length} {filtered.length === 1 ? "aluno" : "alunos"} encontrados
        </Typography>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        <TextField
          placeholder="Buscar por nome..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField
            select
            label="Classe"
            size="small"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="all">Todas as classes</MenuItem>
            {classes.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Idade"
            size="small"
            value={ageFilter}
            onChange={e => setAgeFilter(Number(e.target.value))}
            sx={{ flex: 1 }}
          >
            {AGE_RANGES.map((r, idx) => (
              <MenuItem key={idx} value={idx}>{r.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center", py: 8 }}>
          <PeopleRoundedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Nenhum aluno encontrado.
          </Typography>
        </Card>
      ) : (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <List disablePadding>
            {filtered.map((s, idx) => (
              <Box key={s.id} component={Link} href={`/turmas/${s.class_id}/alunos/${s.id}`} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
                {idx > 0 && <Divider />}
                <ListItem
                  sx={{
                    px: 2, py: 1.5,
                    "&:hover": { bgcolor: "action.hover" },
                    transition: "background 0.15s",
                  }}
                  secondaryAction={
                    <Chip
                      label={s.class_name}
                      size="small"
                      sx={{ fontSize: 11, height: 20 }}
                    />
                  }
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {s.age !== null ? `${s.age} anos` : "Idade não informada"}
                        {s.city ? ` · ${s.city}` : ""}
                      </Typography>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
