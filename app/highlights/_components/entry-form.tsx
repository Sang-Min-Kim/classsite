"use client";

import { useActionState, useEffect, useRef } from "react";

import { saveEntry } from "@/app/highlights/actions";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { HighlightEntry } from "@/lib/highlights";

const inputClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

/** 항목 추가/수정 입력 칸. entry 를 넘기면 '수정', 안 넘기면 '새로 추가' 모드. */
export function EntryForm({
  slug,
  groups,
  groupHeading,
  entry,
  nextOrder = 0,
}: {
  slug: string;
  groups: string[];
  groupHeading: string;
  entry?: HighlightEntry;
  nextOrder?: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveEntry, {});
  const formRef = useRef<HTMLFormElement>(null);

  // 새로 추가에 성공하면 입력 칸 비우기
  useEffect(() => {
    if (state.ok && !entry) formRef.current?.reset();
  }, [state, entry]);

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      <input type="hidden" name="slug" value={slug} />
      {entry?.id ? <input type="hidden" name="id" value={entry.id} /> : null}
      <input type="hidden" name="prev_link_url" value={entry?.link_url ?? ""} />

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">기사 주소 (선택)</span>
        <input
          name="link_url"
          type="url"
          placeholder="https://"
          defaultValue={entry?.link_url ?? ""}
          className={inputClass}
        />
        <span className="text-xs text-muted-foreground">
          뉴스 주소를 넣으면 대표사진을 자동으로 가져오고, 비워 둔 제목·설명·날짜·기관도 채워져요.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">날짜</span>
          <input
            name="date"
            placeholder="예: 2026.10.19"
            defaultValue={entry?.date ?? ""}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">기관 / 장소</span>
          <input name="place" defaultValue={entry?.place ?? ""} className={inputClass} />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">제목</span>
        <input name="title" defaultValue={entry?.title ?? ""} className={inputClass} />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">설명</span>
        <textarea
          name="note"
          rows={2}
          defaultValue={entry?.note ?? ""}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">묶음</span>
          <select name="group_heading" defaultValue={groupHeading} className={inputClass}>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">순서 (작을수록 앞)</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={entry?.sort_order ?? nextOrder}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-6 text-sm">
        <label className="grid gap-1.5">
          <span className="font-medium">사진 (선택, 5MB 이하)</span>
          <input name="image" type="file" accept="image/*" className="text-sm" />
        </label>
        {entry?.image_url ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="remove_image" />
            기존 사진 지우기
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : entry ? "수정 저장" : "추가하기"}
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
