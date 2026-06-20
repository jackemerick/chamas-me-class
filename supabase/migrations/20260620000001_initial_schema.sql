-- ============================================================
-- Chamas-me Class -- Schema inicial
-- Migration: 20260620000001_initial_schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.org_role as enum ('member', 'admin');
create type public.attendance_status as enum ('present', 'absent', 'justified');

-- ============================================================
-- TABELAS
-- ============================================================

create table public.superadmins (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table public.organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  logo_url      text,
  primary_color text not null default '#334035',
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index idx_organizations_slug on public.organizations(slug);

create table public.org_members (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.org_role not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(org_id, user_id)
);

create index idx_org_members_user_id on public.org_members(user_id);
create index idx_org_members_org_id  on public.org_members(org_id);

create table public.classes (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  group_label text,
  created_by  uuid references auth.users(id) on delete set null,
  updated_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_classes_org_id on public.classes(org_id);

create table public.class_teachers (
  class_id   uuid not null references public.classes(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  added_by   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table public.courses (
  id          uuid primary key default uuid_generate_v4(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  name        text not null,
  description text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_courses_class_id on public.courses(class_id);

create table public.students (
  id                uuid primary key default uuid_generate_v4(),
  class_id          uuid not null references public.classes(id) on delete cascade,
  name              text not null,
  birthdate         date,
  responsible_name  text,
  responsible_phone text,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index idx_students_class_id on public.students(class_id);

create table public.meetings (
  id         uuid primary key default uuid_generate_v4(),
  class_id   uuid not null references public.classes(id) on delete cascade,
  course_id  uuid references public.courses(id) on delete set null,
  date       date not null,
  theme      text,
  songs      text[],
  links      jsonb,
  notes      text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_meetings_class_id on public.meetings(class_id);
create index idx_meetings_date     on public.meetings(date);

create table public.meeting_tasks (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid not null references public.meetings(id) on delete cascade,
  title       text not null,
  assigned_to uuid references auth.users(id) on delete set null,
  done        boolean not null default false,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_meeting_tasks_meeting_id on public.meeting_tasks(meeting_id);

create table public.attendance (
  id          uuid primary key default uuid_generate_v4(),
  meeting_id  uuid not null references public.meetings(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  status      public.attendance_status not null default 'absent',
  recorded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique(meeting_id, student_id)
);

create index idx_attendance_meeting_id on public.attendance(meeting_id);
create index idx_attendance_student_id on public.attendance(student_id);

create table public.point_categories (
  id            uuid primary key default uuid_generate_v4(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  name          text not null,
  default_value int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_point_categories_class_id on public.point_categories(class_id);

create table public.points (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.students(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  category_id uuid references public.point_categories(id) on delete set null,
  value       int not null,
  reason      text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_points_student_id on public.points(student_id);
create index idx_points_class_id   on public.points(class_id);

create table public.cert_criteria (
  id                 uuid primary key default uuid_generate_v4(),
  class_id           uuid not null references public.classes(id) on delete cascade,
  course_id          uuid references public.courses(id) on delete cascade,
  min_attendance_pct int not null default 75,
  min_points         int not null default 0,
  created_at         timestamptz not null default now()
);

create index idx_cert_criteria_class_id on public.cert_criteria(class_id);

create table public.certificates (
  id         uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id   uuid not null references public.classes(id) on delete cascade,
  course_id  uuid references public.courses(id) on delete set null,
  issued_by  uuid references auth.users(id) on delete set null,
  issued_at  timestamptz not null default now(),
  pdf_url    text,
  created_at timestamptz not null default now()
);

create index idx_certificates_student_id on public.certificates(student_id);
create index idx_certificates_class_id   on public.certificates(class_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

create trigger trg_meetings_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

-- ============================================================
-- FUNCOES AUXILIARES (criadas apos todas as tabelas)
-- ============================================================

create or replace function public.is_superadmin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.superadmins where user_id = auth.uid()
  );
$$;

create or replace function public.my_org_ids()
returns setof uuid language sql security definer stable as $$
  select org_id from public.org_members where user_id = auth.uid();
$$;

create or replace function public.my_role_in_org(p_org_id uuid)
returns text language sql security definer stable as $$
  select role::text from public.org_members
  where user_id = auth.uid() and org_id = p_org_id;
$$;

-- ============================================================
-- RLS
-- ============================================================

alter table public.superadmins      enable row level security;
alter table public.organizations    enable row level security;
alter table public.org_members      enable row level security;
alter table public.classes          enable row level security;
alter table public.class_teachers   enable row level security;
alter table public.courses          enable row level security;
alter table public.students         enable row level security;
alter table public.meetings         enable row level security;
alter table public.meeting_tasks    enable row level security;
alter table public.attendance       enable row level security;
alter table public.point_categories enable row level security;
alter table public.points           enable row level security;
alter table public.cert_criteria    enable row level security;
alter table public.certificates     enable row level security;

-- superadmins
create policy "superadmin gerencia superadmins" on public.superadmins
  for all using (public.is_superadmin());

-- organizations
create policy "superadmin ve tudo em organizations" on public.organizations
  for all using (public.is_superadmin());
create policy "member ve propria org" on public.organizations
  for select using (id in (select public.my_org_ids()));
create policy "admin atualiza propria org" on public.organizations
  for update using (public.my_role_in_org(id) = 'admin');
create policy "qualquer auth cria org" on public.organizations
  for insert with check (auth.uid() is not null);

-- org_members
create policy "superadmin ve tudo em org_members" on public.org_members
  for all using (public.is_superadmin());
create policy "member ve membros da propria org" on public.org_members
  for select using (org_id in (select public.my_org_ids()));
create policy "admin gerencia membros" on public.org_members
  for all using (public.my_role_in_org(org_id) = 'admin');
create policy "usuario ve proprio registro" on public.org_members
  for select using (user_id = auth.uid());
create policy "qualquer auth insere proprio registro" on public.org_members
  for insert with check (user_id = auth.uid());

-- classes
create policy "superadmin ve tudo em classes" on public.classes
  for all using (public.is_superadmin());
create policy "member da org acessa turmas" on public.classes
  for all using (org_id in (select public.my_org_ids()));

-- class_teachers
create policy "superadmin ve tudo em class_teachers" on public.class_teachers
  for all using (public.is_superadmin());
create policy "member da org ve professores" on public.class_teachers
  for select using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );
create policy "member da org gerencia professores" on public.class_teachers
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- courses
create policy "superadmin ve tudo em courses" on public.courses
  for all using (public.is_superadmin());
create policy "member da org acessa cursos" on public.courses
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- students
create policy "superadmin ve tudo em students" on public.students
  for all using (public.is_superadmin());
create policy "member da org acessa alunos" on public.students
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- meetings
create policy "superadmin ve tudo em meetings" on public.meetings
  for all using (public.is_superadmin());
create policy "member da org acessa encontros" on public.meetings
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- meeting_tasks
create policy "superadmin ve tudo em meeting_tasks" on public.meeting_tasks
  for all using (public.is_superadmin());
create policy "member da org acessa tarefas" on public.meeting_tasks
  for all using (
    meeting_id in (
      select id from public.meetings
      where class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
    )
  );

-- attendance
create policy "superadmin ve tudo em attendance" on public.attendance
  for all using (public.is_superadmin());
create policy "member da org acessa presenca" on public.attendance
  for all using (
    meeting_id in (
      select id from public.meetings
      where class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
    )
  );

-- point_categories
create policy "superadmin ve tudo em point_categories" on public.point_categories
  for all using (public.is_superadmin());
create policy "member da org acessa categorias" on public.point_categories
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- points
create policy "superadmin ve tudo em points" on public.points
  for all using (public.is_superadmin());
create policy "member da org acessa pontos" on public.points
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- cert_criteria
create policy "superadmin ve tudo em cert_criteria" on public.cert_criteria
  for all using (public.is_superadmin());
create policy "member da org acessa criterios" on public.cert_criteria
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- certificates
create policy "superadmin ve tudo em certificates" on public.certificates
  for all using (public.is_superadmin());
create policy "member da org acessa certificados" on public.certificates
  for all using (
    class_id in (select id from public.classes where org_id in (select public.my_org_ids()))
  );

-- ============================================================
-- SEED: superadmin inicial
-- Rodar separadamente apos criar o usuario no Supabase Auth:
--
-- insert into public.superadmins (user_id)
-- select id from auth.users where email = 'jack@jackemerick.com.br';
-- ============================================================
