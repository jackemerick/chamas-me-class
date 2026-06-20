"use client";

import { useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { criarCategoria, editarCategoria, excluirCategoria } from "@/actions/points";

interface ClassOption { id: string; name: string }
interface Category { id: string; class_id: string; name: string; default_value: number }
interface StudentRank { id: string; name: string; class_id: string; class_name: string; total: number }

interface PontosClientProps {
  classes: ClassOption[];
  categories: Category[];
  ranking: StudentRank[];
}

export function PontosClient({ classes, categories: initialCategories, ranking }: PontosClientProps) {
  const [tab, setTab] = useState(0); // 0 = ranking, 1 = categorias
  const [classFilter, setClassFilter] = useState(classes[0]?.id ?? "");
  const [categories, setCategories] = useState(initialCategories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // form nova categoria
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState(10);

  // form edição
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState(10);

  const filteredRanking = classFilter
    ? ranking.filter(s => s.class_id === classFilter)
    : ranking;

  const filteredCategories = categories.filter(c => c.class_id === classFilter);

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("class_id", classFilter);
    fd.set("name", newName.trim());
    fd.set("default_value", String(newValue));
    const result = await criarCategoria(fd);
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Categoria criada.");
    setCategories(prev => [...prev, { id: crypto.randomUUID(), class_id: classFilter, name: newName.trim(), default_value: newValue }]);
    setNewName(""); setNewValue(10); setShowNewCat(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditValue(cat.default_value);
  }

  async function handleEdit(catId: string) {
    setSaving(true);
    const fd = new FormData();
    fd.set("id", catId);
    fd.set("class_id", classFilter);
    fd.set("name", editName.trim());
    fd.set("default_value", String(editValue));
    const result = await editarCategoria(fd);
    setSaving(false);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Categoria atualizada.");
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: editName.trim(), default_value: editValue } : c));
    setEditingId(null);
  }

  async function handleDelete(catId: string) {
    if (!confirm("Excluir esta categoria?")) return;
    const fd = new FormData(); fd.set("id", catId);
    const result = await excluirCategoria(fd);
    if (result?.error) { toast.error(result.error); return; }
    toast.success("Categoria removida.");
    setCategories(prev => prev.filter(c => c.id !== catId));
  }

  const medalColors = ["#FFD166", "#C0C0C0", "#CD7F32"];

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Pontos</Typography>

      {/* Seletor de classe */}
      <TextField
        select label="Classe" size="small" value={classFilter}
        onChange={e => setClassFilter(e.target.value)}
        sx={{ mb: 2.5, minWidth: 200 }}
      >
        {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
      </TextField>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Ranking" icon={<EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ minHeight: 40, fontSize: 13 }} />
        <Tab label="Categorias" icon={<SettingsRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ minHeight: 40, fontSize: 13 }} />
      </Tabs>

      {/* Tab Ranking */}
      {tab === 0 && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          {filteredRanking.length === 0 ? (
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Nenhum ponto registrado ainda.</Typography>
            </CardContent>
          ) : (
            filteredRanking.map((s, idx) => (
              <Box key={s.id}>
                {idx > 0 && <Divider />}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25 }}>
                  {idx < 3 ? (
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: medalColors[idx] + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: medalColors[idx] }}>{idx + 1}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ width: 28, textAlign: "center", color: "text.disabled", fontWeight: 700 }}>{idx + 1}</Typography>
                  )}
                  <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 12, fontWeight: 700 }}>
                    {s.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>{s.name}</Typography>
                  <Chip label={`${s.total} pts`} size="small" sx={{ fontWeight: 700, bgcolor: idx === 0 ? "#FFD16630" : "action.hover", color: idx === 0 ? "#b38a00" : "text.primary" }} />
                </Box>
              </Box>
            ))
          )}
        </Card>
      )}

      {/* Tab Categorias */}
      {tab === 1 && (
        <Box>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 2 }}>
            {filteredCategories.length === 0 && (
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">Nenhuma categoria nesta classe.</Typography>
              </CardContent>
            )}
            {filteredCategories.map((cat, idx) => (
              <Box key={cat.id}>
                {idx > 0 && <Divider />}
                {editingId === cat.id ? (
                  <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField size="small" value={editName} onChange={e => setEditName(e.target.value)} sx={{ flex: 1 }} label="Nome" />
                    <TextField size="small" type="number" value={editValue} onChange={e => setEditValue(parseInt(e.target.value) || 1)} sx={{ width: 90 }} label="Pontos" slotProps={{ htmlInput: { min: 1 } }} />
                    <Button size="small" variant="contained" onClick={() => handleEdit(cat.id)} disabled={saving}>
                      {saving ? <CircularProgress size={14} color="inherit" /> : "OK"}
                    </Button>
                    <Button size="small" onClick={() => setEditingId(null)}>X</Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.25, gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>{cat.name}</Typography>
                    <Chip label={`${cat.default_value} pts`} size="small" />
                    <IconButton size="small" onClick={() => startEdit(cat)}><EditRoundedIcon sx={{ fontSize: 15 }} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}><DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} /></IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Card>

          {/* Nova categoria */}
          <Collapse in={showNewCat}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 1.5 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Nova categoria</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField size="small" label="Nome" value={newName} onChange={e => setNewName(e.target.value)} sx={{ flex: 1 }} placeholder="Ex: Trouxe bíblia" />
                  <TextField size="small" type="number" label="Pontos" value={newValue} onChange={e => setNewValue(parseInt(e.target.value) || 1)} sx={{ width: 90 }} slotProps={{ htmlInput: { min: 1 } }} />
                </Box>
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Button variant="outlined" size="small" fullWidth onClick={() => setShowNewCat(false)}>Cancelar</Button>
                  <Button variant="contained" size="small" fullWidth onClick={handleCreate} disabled={saving || !newName.trim()}>
                    {saving ? <CircularProgress size={14} color="inherit" /> : "Criar"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Collapse>

          {!showNewCat && (
            <Button variant="outlined" fullWidth startIcon={<AddRoundedIcon />} onClick={() => setShowNewCat(true)}>
              Nova categoria
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
