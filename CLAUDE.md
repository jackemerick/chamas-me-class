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
- **Mobile first obrigatório** — app usado principalmente no celular pelos professores
- Admin+ pode customizar cores e logo da organizacao

---

## Autenticacao

- Magic link por e-mail via Resend (sem senha)
- Supabase Auth com custom SMTP configurado para Resend
- Apos login, usuario e direcionado para onboarding (criar ou entrar em org)

---

## Roles e permissoes

Cada igreja e uma organizacao independente.

| Role | Escopo |
|---|---|
| `superadmin` | Global. Ve todas as orgs. Bypass de RLS. |
| `admin` | Gerencia a org: convida membros, define turmas dos professores, promove admins, customiza cores/logo |
| `member` | Professor. Ve apenas as turmas em que esta vinculado. |

**Regras importantes:**
- Professor (`member`) ve a lista de turmas da org, mas so acessa dados (alunos, encontros, presenca, pontos) das turmas em que esta vinculado
- Professor pode clicar em uma turma em que NAO esta vinculado e solicitar acesso — o admin aprova
- Ao convidar um professor, o admin ja define a turma (ou turmas) a que ele pertence
- Somente admin pode vincular professores a turmas
- Admin pode promover outro membro a admin

RLS: toda query filtra por `org_id` via `org_members`. Acesso a turma filtra via `class_teachers`. Superadmin bypassa via `is_superadmin()`.

---

## Funcionalidades

1. **Auth** — magic link por e-mail (Resend)
2. **Multi-tenant** — cada igreja = uma org
3. **Turmas** — admin cria turmas e vincula professores. Professor ve so as suas.
4. **Alunos** — cadastro manual (nome, nascimento, cidade, responsavel, telefone). Deduplicacao por nome + nascimento + cidade dentro da mesma org.
5. **Agenda** — calendario mensal com encontros agendados. Proximo encontro destacado. Botao + para novo encontro.
6. **Encontros** — agendamento com ou sem recorrencia. Campos: tema, turma, responsavel (professor da turma), musica (link que busca titulo), notas ricas (negrito, links, etc.)
7. **Presenca** — por aluno x encontro (presente / falta / justificada). Marcacao rapida: "todos presentes" e desmarca individualmente.
8. **Pontos** — categorias por turma, valor + motivo livre, ranking
9. **Certificados** — criterios configuraveis (% presenca + pontos minimos), PDF via @react-pdf/renderer
10. **Dashboard** — engajamento por turma (presenca, pontos, participacao)
11. **Admin** — convidar membros com turma ja definida, aprovar solicitacoes de acesso, promover admin, gerenciar org
12. **Superadmin** — ver todas as organizacoes

---

## Modelo de dados (Supabase/PostgreSQL)

```
organizations        -> id, name, slug, logo_url, primary_color, created_by, created_at
org_members          -> id, org_id, user_id, role (member/admin), invited_by, created_at
class_teachers       -> id, class_id, user_id, added_by, created_at  (vinculo professor <> turma)
access_requests      -> id, class_id, user_id, status (pending/approved/rejected), created_at
classes              -> id, org_id, name, group_label, created_by, updated_by, created_at
students             -> id, class_id, name, birthdate, city, responsible_name, responsible_phone, created_by
meetings             -> id, class_id, date, theme, recurrence (none/weekly/biweekly/monthly),
                        recurrence_end_date, responsible_user_id, music_url, music_title, notes (text), created_by, updated_by
attendance           -> id, meeting_id, student_id, status (present/absent/justified), recorded_by
points               -> id, student_id, class_id, value, reason, recorded_by, created_at
cert_criteria        -> id, class_id, min_attendance_pct, min_points
certificates         -> id, student_id, class_id, issued_by, issued_at, pdf_url (nullable)
```

**Removidos do modelo original:** courses, meeting_tasks, point_categories (simplificados)

---

## Navegacao mobile (OBRIGATORIO)

O app e usado principalmente no celular. Regras:

- Bottom navigation bar fixa com 5 itens: Início, Turmas, Agenda, Pontos, Admin (so para admin)
- Sidebar so aparece em desktop (md+)
- Botoes de acao com altura minima 48px
- Listas com itens de pelo menos 56px de altura para toque facil
- Nenhum elemento interativo menor que 44px

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
- 2026-06-20: auth, multi-tenant, turmas, alunos com deduplicacao, convite por e-mail, painel admin
- Decisoes de produto (2026-06-20):
  - Encontros virou "Agenda" com calendario
  - Professores veem so suas turmas (nao tudo da org)
  - Vinculo professor-turma obrigatorio no convite (admin define)
  - Solicitar acesso a turma: professor clica e admin aprova
  - Navegacao mobile: bottom navigation bar (nao sidebar)
  - Template de encontro removido (planejamento livre via notas)
