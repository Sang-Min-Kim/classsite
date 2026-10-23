import { sampleItems, siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";
import type { Item } from "@/lib/types";

/**
 * 특정 섹션의 카드 목록을 가져옵니다.
 * - Supabase가 연결 안 됐으면: site.config.ts 의 예시 카드를 보여줌
 * - 연결됐으면: 데이터베이스에서 '보이기'로 설정된 카드만 순서대로 가져옴
 */
export async function getItems(section: string): Promise<Item[]> {
  const supabase = getPublicClient();
  const samples = sampleItems.filter((item) => item.section === section);
  if (!supabase) return samples;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("section", section)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getItems] Supabase 읽기 실패:", error.message);
    return samples;
  }
  return (data ?? []) as Item[];
}

/** 관리자 페이지에서 고칠 수 있는 히어로 글자들 (site_texts 표의 key 와 같음) */
export const HERO_TEXT_KEYS = [
  "hero_eyebrow",
  "hero_title",
  "hero_description",
  "hero_primary_label",
  "hero_secondary_label",
] as const;

export type HeroTextKey = (typeof HERO_TEXT_KEYS)[number];
export type HeroTexts = Record<HeroTextKey, string>;

/** site.config.ts 에 적힌 기본 히어로 글자 */
export function getDefaultHeroTexts(): HeroTexts {
  const { hero } = siteConfig;
  return {
    hero_eyebrow: hero.eyebrow,
    hero_title: hero.title,
    hero_description: hero.description,
    hero_primary_label: hero.primaryCta.label,
    hero_secondary_label: hero.secondaryCta.label,
  };
}

/**
 * 히어로 글자를 가져옵니다.
 * - 관리자 페이지에서 저장한 글자가 있으면 그 글자를 씀
 * - 없거나(빈 칸), Supabase가 연결 안 됐으면: site.config.ts 의 기본 글자를 씀
 */
export async function getHeroTexts(): Promise<HeroTexts> {
  const texts = getDefaultHeroTexts();
  const supabase = getPublicClient();
  if (!supabase) return texts;

  const { data, error } = await supabase
    .from("site_texts")
    .select("key, value")
    .in("key", [...HERO_TEXT_KEYS]);

  if (error) {
    console.error("[getHeroTexts] Supabase 읽기 실패:", error.message);
    return texts;
  }
  for (const row of data ?? []) {
    if (row.value && (HERO_TEXT_KEYS as readonly string[]).includes(row.key)) {
      texts[row.key as HeroTextKey] = row.value;
    }
  }
  return texts;
}
