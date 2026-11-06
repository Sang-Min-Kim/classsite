"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { previewLink, saveEntry } from "@/app/highlights/actions";
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
  const formRef = useRef<HTMLFormElement>(null);
  const lastLink = useRef(entry?.link_url ?? "");
  const [loadingLink, setLoadingLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");
  const [linkImage, setLinkImage] = useState("");

  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveEntry(prev, formData);
    // 새로 추가에 성공하면 기사 미리보기도 비우기
    if (result.ok && !entry) {
      lastLink.current = "";
      setLinkMessage("");
      setLinkImage("");
    }
    return result;
  }, {});

  // 새로 추가에 성공하면 입력 칸 비우기
  useEffect(() => {
    if (state.ok && !entry) formRef.current?.reset();
  }, [state, entry]);

  /** 기사 주소를 넣으면(붙여넣기 또는 칸 밖을 누르면) 비어 있는 칸을 기사 정보로 바로 채움 */
  async function fillFromLink(value: string) {
    const url = value.trim();
    if (!url || url === lastLink.current) return;
    lastLink.current = url;

    setLoadingLink(true);
    setLinkMessage("기사 정보를 가져오는 중...");
    const result = await previewLink(url);
    setLoadingLink(false);

    if (!result.ok) {
      setLinkMessage(result.message ?? "");
      setLinkImage("");
      return;
    }
    const form = formRef.current;
    for (const name of ["date", "title", "note", "place"] as const) {
      const field = form?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (field && !field.value.trim() && result[name]) field.value = result[name];
    }
    setLinkImage(result.image ?? "");
    setLinkMessage(
      result.image
        ? "기사 정보로 빈 칸을 채웠어요. 확인 후 저장하세요."
        : "빈 칸을 채웠어요. (대표사진은 찾지 못했어요. 사진을 직접 올릴 수 있어요)",
    );
  }

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
          onBlur={(e) => fillFromLink(e.currentTarget.value)}
          onPaste={(e) => {
            const input = e.currentTarget;
            setTimeout(() => fillFromLink(input.value)); // 붙여넣은 글자가 칸에 들어간 다음 실행
          }}
        />
        <span className={loadingLink ? "text-xs text-highlight" : "text-xs text-muted-foreground"}>
          {linkMessage ||
            "뉴스 주소만 붙여넣으면 날짜·기관·제목·설명·대표사진이 자동으로 채워져요."}
        </span>
        {linkImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={linkImage} alt="대표사진 미리보기" className="mt-1 aspect-video w-48 rounded-md border object-cover" />
        ) : null}
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
