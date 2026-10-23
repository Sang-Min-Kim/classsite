"use client";

import { useActionState } from "react";

import { saveHeroTexts, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { HeroTexts, HeroTextKey } from "@/lib/data";

const inputClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";
const textareaClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

/* 입력 칸 목록 (위에서부터 화면에 보이는 순서) */
const FIELDS: { key: HeroTextKey; label: string; multiline?: boolean }[] = [
  { key: "hero_eyebrow", label: "위쪽 작은 글씨" },
  { key: "hero_title", label: "큰 제목 (Enter 로 줄바꿈)", multiline: true },
  { key: "hero_description", label: "설명 문장", multiline: true },
  { key: "hero_primary_label", label: "첫 번째 버튼 글자" },
  { key: "hero_secondary_label", label: "두 번째 버튼 글자" },
];

/** 히어로 문구 수정 입력 칸. 빈 칸으로 저장하면 기본 글자(site.config.ts)로 돌아갑니다. */
export function HeroForm({ texts, defaults }: { texts: HeroTexts; defaults: HeroTexts }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHeroTexts, {});

  return (
    <form action={action} className="grid gap-4">
      {FIELDS.map((field) => (
        <label key={field.key} className="grid gap-1.5 text-sm">
          <span className="font-medium">{field.label}</span>
          {field.multiline ? (
            <textarea
              name={field.key}
              rows={3}
              defaultValue={texts[field.key]}
              placeholder={defaults[field.key]}
              className={textareaClass}
            />
          ) : (
            <input
              name={field.key}
              defaultValue={texts[field.key]}
              placeholder={defaults[field.key]}
              className={inputClass}
            />
          )}
        </label>
      ))}

      <p className="text-xs text-muted-foreground">
        칸을 비우고 저장하면 기본 글자(흐리게 보이는 글자)로 돌아갑니다.
      </p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장하기"}
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
