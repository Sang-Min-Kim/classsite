import { siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";

/** 하이라이트 자세히 보기 화면의 항목 한 줄. supabase/schema.sql 의 highlight_entries 표와 같습니다. */
export type HighlightEntry = {
  /** 기본 항목(site.config.ts)이면 없음, 데이터베이스 항목이면 있음 */
  id?: string;
  group_heading: string;
  date: string;
  title: string;
  note?: string | null;
  place?: string | null;
  image_url?: string | null;
  /** 뉴스 등 기사 주소. 있으면 제목·사진을 누르면 그 기사로 이동 */
  link_url?: string | null;
  sort_order: number;
};

type ConfigEntry = { date: string; title: string; note?: string; place?: string; image?: string };

export function findHighlight(slug: string) {
  return siteConfig.highlights.items.find((item) => item.slug === slug);
}

/** site.config.ts 에 적힌 기본 항목을 데이터베이스 모양으로 바꿔서 돌려줍니다. */
export function getDefaultEntries(slug: string): HighlightEntry[] {
  const item = findHighlight(slug);
  if (!item) return [];
  return item.detail.groups.flatMap((group) =>
    (group.entries as ConfigEntry[]).map((entry, i) => ({
      group_heading: group.heading,
      date: entry.date,
      title: entry.title,
      note: entry.note ?? null,
      place: entry.place ?? null,
      image_url: entry.image ?? null,
      sort_order: (i + 1) * 10,
    })),
  );
}

/**
 * 화면에 보여줄 항목을 가져옵니다.
 * - 데이터베이스에 저장된 항목이 있으면 그 항목 (fromDb = true)
 * - 없거나 Supabase가 연결 안 됐으면: site.config.ts 의 기본 항목 (fromDb = false)
 */
export async function getHighlightEntries(
  slug: string,
): Promise<{ entries: HighlightEntry[]; fromDb: boolean }> {
  const defaults = { entries: getDefaultEntries(slug), fromDb: false };
  const supabase = getPublicClient();
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from("highlight_entries")
    .select("*")
    .eq("slug", slug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getHighlightEntries] Supabase 읽기 실패:", error.message);
    return defaults;
  }
  if (!data || data.length === 0) return defaults;
  return { entries: data as HighlightEntry[], fromDb: true };
}
