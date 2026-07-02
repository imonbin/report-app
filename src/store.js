import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ══════════════════════════════════════════
   永続ストレージ（Supabase版）
   App.jsx 側のインターフェースは window.storage 版と
   互換性を保ち、呼び出し側のロジックを変えずに済むようにしている
══════════════════════════════════════════ */
export const Store = {
  // 一覧用のメタ情報だけ取得（pagesは含めない＝高速）
  async loadIndex() {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, client_company, work_place, work_date, cover_type, photo_count, date_str")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        clientCompany: r.client_company,
        workPlace: r.work_place,
        workDate: r.work_date,
        coverType: r.cover_type,
        photoCount: r.photo_count,
        date: r.date_str,
      }));
    } catch (e) {
      console.error("loadIndex:", e);
      return [];
    }
  },

  // インデックスは個別レコードのupsertで管理するため、
  // saveIndexは「一括保存」目的にのみ使う（通常はsaveReportが兼ねる）
  async saveIndex(list) {
    try {
      const rows = list.map(m => ({
        id: m.id,
        title: m.title,
        client_company: m.clientCompany,
        work_place: m.workPlace,
        work_date: m.workDate,
        cover_type: m.coverType,
        photo_count: m.photoCount,
        date_str: m.date,
      }));
      if (rows.length === 0) return;
      const { error } = await supabase.from("reports").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    } catch (e) {
      console.error("saveIndex:", e);
    }
  },

  async loadReport(id) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("pages")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data ? data.pages : null;
    } catch (e) {
      console.error("loadReport:", e);
      return null;
    }
  },

  // meta + pages を1レコードとしてupsert（インデックスと本文を同時に保存）
  async saveReport(id, pages, meta = null) {
    try {
      const row = { id, pages };
      if (meta) {
        row.title = meta.title;
        row.client_company = meta.clientCompany;
        row.work_place = meta.workPlace;
        row.work_date = meta.workDate;
        row.cover_type = meta.coverType;
        row.photo_count = meta.photoCount;
        row.date_str = meta.date;
      }
      const { error } = await supabase.from("reports").upsert(row, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("saveReport:", e);
      return false;
    }
  },

  async deleteReport(id) {
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("deleteReport:", e);
    }
  },

  async loadDrawings() {
    try {
      const { data, error } = await supabase
        .from("drawings")
        .select("id, data")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map(d => ({ id: d.id, ...d.data }));
    } catch (e) {
      console.error("loadDrawings:", e);
      return [];
    }
  },

  async saveDrawings(list) {
    try {
      // 図面ライブラリは全置換方式（一覧編集画面でまとめて保存する想定）
      const { data: existing } = await supabase.from("drawings").select("id");
      const existingIds = new Set((existing || []).map(d => d.id));
      const currentIds = new Set(list.map(d => d.id));

      const toDelete = [...existingIds].filter(id => !currentIds.has(id));
      if (toDelete.length > 0) {
        await supabase.from("drawings").delete().in("id", toDelete);
      }

      const rows = list.map(({ id, ...rest }) => ({ id, data: rest }));
      if (rows.length > 0) {
        const { error } = await supabase.from("drawings").upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }
    } catch (e) {
      console.error("saveDrawings:", e);
    }
  },
};
