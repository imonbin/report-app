-- ════════════════════════════════════════════════════
-- 日都産業 作業完了報告書管理システム
-- Supabaseテーブル作成SQL
-- Supabaseダッシュボード → SQL Editor → New query に貼り付けて実行
-- ════════════════════════════════════════════════════

-- 報告書テーブル（meta情報 + ページ内容をJSONで丸ごと保存）
create table reports (
  id text primary key,
  title text,
  client_company text,
  work_place text,
  work_date text,
  cover_type text,
  photo_count int,
  date_str text,
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 図面ライブラリテーブル
create table drawings (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

-- 更新日時を自動更新するトリガー
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_reports_updated_at
before update on reports
for each row execute function set_updated_at();

-- Row Level Security（共通パスワードで運用するためanonキーに全権限を許可）
alter table reports enable row level security;
alter table drawings enable row level security;

create policy "anon_all_reports" on reports
  for all using (true) with check (true);

create policy "anon_all_drawings" on drawings
  for all using (true) with check (true);
