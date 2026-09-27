-- ════════════════════════════════════════════════════
-- 日都産業 作業完了報告書（iPhoneシンプル版）
-- Supabaseテーブル作成SQL
-- Supabaseダッシュボード → SQL Editor → New query に貼り付けて実行
--
-- 既存のWeb版（reports / drawings テーブル）とは別テーブルなので
-- Web版のデータには一切影響しません。同じSupabaseプロジェクトに
-- 追加しても問題ありません。
-- ════════════════════════════════════════════════════

create table if not exists simple_reports (
  id text primary key,
  orientation text not null default 'portrait', -- 'portrait' | 'landscape'
  title text,
  work_place text,
  work_date text,
  data jsonb not null default '{}'::jsonb, -- 表紙・写真ページの内容を丸ごと保存
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 更新日時を自動更新する関数（Web版で既に作成済みなら CREATE OR REPLACE で上書きしてOK）
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_simple_reports_updated_at on simple_reports;
create trigger trg_simple_reports_updated_at
before update on simple_reports
for each row execute function set_updated_at();

-- Row Level Security（共通パスワードで運用するためanonキーに全権限を許可）
alter table simple_reports enable row level security;

drop policy if exists "anon_all_simple_reports" on simple_reports;
create policy "anon_all_simple_reports" on simple_reports
  for all using (true) with check (true);
