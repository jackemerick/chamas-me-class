"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassForm } from "./class-form";

export function NewClassButton() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Nova turma</h3>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ClassForm mode="create" onCancel={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <Button onClick={() => setOpen(true)} style={{ backgroundColor: "#334035" }} className="gap-2">
      <Plus className="w-4 h-4" />
      Nova turma
    </Button>
  );
}
