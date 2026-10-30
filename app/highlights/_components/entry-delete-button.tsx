"use client";

import { Trash2 } from "lucide-react";

import { deleteEntry } from "@/app/highlights/actions";
import { Button } from "@/components/ui/button";

/** 항목 삭제 버튼 — 실수 방지를 위해 한 번 더 물어봅니다. */
export function EntryDeleteButton({
  id,
  slug,
  imageUrl,
}: {
  id: string;
  slug: string;
  imageUrl?: string | null;
}) {
  return (
    <form
      action={deleteEntry}
      onSubmit={(e) => {
        if (!window.confirm("이 항목을 삭제할까요? 되돌릴 수 없습니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="image_url" value={imageUrl ?? ""} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
        <Trash2 />
        삭제
      </Button>
    </form>
  );
}
