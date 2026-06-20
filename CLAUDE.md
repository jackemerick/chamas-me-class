# Chamas-me Class — Contexto do Projeto

## Identificacao
- **Nome:** Chamas-me Class
- **Cliente:** Chamas-me
- **Pasta:** `~/jacklab/clientes/chamas-me/sites/chamas-me-class/`
- **Dominio futuro:** class.chamas.me (configurar apos MVP — rodar local por enquanto)
- **Repo GitHub:** https://github.com/jackemerick/chamas-me-class (publico)
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase + Resend + @react-pdf/renderer + Zustand + Zod + React Hook Form
- **Deploy futuro:** Vercel

---

## O que e o Chamas-me Class

Sistema web de gestao de classes biblicas (CBSTA - Classe Biblica Seguindo a Trilha do Alto).
Publico: professores e organizadores de classes infantis e adolescentes.

Nao e projeto comercial. E projeto de ministerio vinculado ao Chamas-me.

---

## Identidade visual

Segue a identidade do Chamas-me. Cores padrão (customizaveis por org):

| Token | Hex |
|---|---|
| Principal (dark) | `#334035` |
| Secundario | `#586F7C` |
| Destaque | `#F2542D` |
| Verde | `#7DAF9C` |
| Amarelo | `#FFD166` |
| Light | `#F4F4F9` |

- Tipografia titulo: Phenomena Black
- Tipografia texto: Ubuntu
- Mobile first, otimizado para desktop
- Admin+ pode customizar cores e logo da organizacao

---

## Autenticacao

- Magic link por e-mail via Resend (sem senha)
- Supabase Auth com custom SMTP configurado para Resend
- Apos login, usuario e direcionado para onboarding (criar ou entrar em org)

---

## Multi-tenant e roles

Cada igreja e uma organizacao independente.

| Role | Escopo |
|---|---|
| `superadmin` | Global. Ve todas as orgs. Bypass de RLS. |
| `admin` | Gerencia a org (convidar membros, promover, customizar cores/logo) |
| `member` | Professor. Acessa tudo da org. Pode criar turmas. |

RLS: toda query filtra por `org_id` via `org_members` do usuario autenticado. Superadmin bypassa via funcao `is_superadmin()`.

---

## Funcionalidades

1. **Auth** - magic link por e-mail (Resend)
2. **Multi-tenant** - cada igreja = uma org. Roles: superadmin / admin / member
3. **Turmas** - qualquer member cria turmas. Registra created_by/updated_by
4. **Alunos** - cadastro manual (nome, nascimento, responsavel, telefone). Sem login.
5. **Cursos** - curriculo livre dentro de cada turma (ex: Biblia, Missoes, Memoria)
6. **Encontros** - planejamento com tema, musicas, links Google Docs, responsaveis por tarefa
7. **Presenca** - por aluno x encontro (presente / falta / justificada)
8. **Pontos** - categorias por turma, valor + motivo livre, ranking
9. **Certificados** - criterios configuraveis (% presenca + pontos minimos), PDF via @react-pdf/renderer. Org pode ter logo e cores proprias.
10. **Dashboard** - engajamento por turma (presenca, pontos, participacao)
11. **Admin** - convidar membros, promover admin, gerenciar org (cores, logo)
12. **Superadmin** - ver todas as organizacoes

---

## Modelo de dados (Supabase/PostgreSQL)

```
organizations        -> id, name, slug, logo_url, primary_color, created_by, created_at
org_members          -> id, org_id, user_id, role (member/admin), invited_by, created_at
classes              -> id, org_id, name, group_label, created_by, updated_by, created_at
class_teachers       -> class_id, user_id, added_by
courses              -> id, class_id, name, description, created_by
students             -> id, class_id, name, birthdate, responsible_name, responsible_phone, created_by
meetings             -> id, class_id, course_id (nullable), date, theme, songs (text[]), links (jsonb), notes, created_by, updated_by
meeting_tasks        -> id, meeting_id, title, assigned_to (user_id), done, created_by
attendance           -> id, meeting_id, student_id, status (present/absent/justified), recorded_by
point_categories     -> id, class_id, name, default_value
points               -> id, student_id, class_id, category_id (nullable), value, reason, recorded_by, created_at
cert_criteria        -> id, class_id, course_id (nullable), min_attendance_pct, min_points
certificates         -> id, student_id, class_id, course_id (nullable), issued_by, issued_at, pdf_url (nullable)
```

---

## Organizacao de teste

- Nome: CBSTA
- Superadmin: jack@jackemerick.com.br

---

## Padroes de codigo

- TypeScript estrito, sem `any`
- Server Components por padrao; Client so quando necessario
- Imports absolutos (`@/components/...`)
- Nomes em ingles no codigo, comentarios em portugues
- Commits: Conventional Commits PT-BR ("feat: adiciona...")
- Autoria: "Jack Emerick 🥷 - jack@jackemerick.com.br"
- Sem travessao (--) em nenhum texto do app

---

## Variaveis de ambiente necessarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Status e historico

- Projeto iniciado: 2026-06-20
- Etapa atual: scaffolding + schema do banco
