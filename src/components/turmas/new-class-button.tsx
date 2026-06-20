"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ClassForm } from "./class-form";

export function NewClassButton() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>Nova classe</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <ClassForm mode="create" onCancel={() => setOpen(false)} />
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<AddRoundedIcon />}
      onClick={() => setOpen(true)}
    >
      Nova classe
    </Button>
  );
}
