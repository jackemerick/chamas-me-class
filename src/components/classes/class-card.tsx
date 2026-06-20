import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

interface ClassCardProps {
  id: string;
  name: string;
  groupLabel: string | null;
  studentCount: number;
}

export function ClassCard({ id, name, groupLabel, studentCount }: ClassCardProps) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <CardActionArea component={Link} href={`/turmas/${id}`} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} noWrap>{name}</Typography>
              {groupLabel && (
                <Chip label={groupLabel} size="small" sx={{ mt: 0.75, height: 22, fontSize: 11 }} />
              )}
            </Box>
            <ChevronRightRoundedIcon sx={{ color: "text.disabled", fontSize: 20, mt: 0.25, flexShrink: 0 }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PeopleRoundedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {studentCount} {studentCount === 1 ? "aluno" : "alunos"}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
