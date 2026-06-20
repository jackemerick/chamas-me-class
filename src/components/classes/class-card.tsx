import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassCardProps {
  id: string;
  name: string;
  groupLabel: string | null;
  studentCount: number;
}

export function ClassCard({ id, name, groupLabel, studentCount }: ClassCardProps) {
  return (
    <Link href={`/turmas/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              {groupLabel && (
                <Badge
                  variant="secondary"
                  className="mt-1.5 text-xs"
                >
                  {groupLabel}
                </Badge>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>
              {studentCount} {studentCount === 1 ? "aluno" : "alunos"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
