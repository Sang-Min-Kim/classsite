"use server";

/* 하이라이트 자세히 보기 화면의 버튼들이 실제로 하는 일 (서버에서 실행됨)
   - importDefaults : site.config.ts 의 기본 항목을 데이터베이스로 복사 (편집 시작)
   - saveEntry      : 항목 추가 또는 수정 (사진 업로드, 기사 주소 → 대표사진 자동 가져오기 포함)
   - deleteEntry    : 항목 삭제
   모두 관리자로 로그인했을 때만 동작합니다. */

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin-auth";
import { getAdminClient, IMAGE_BUCKET } from "@/lib/supabase-admin";
import { fillPreviewImages, findHighlight, getDefaultEntries } from "@/lib/highlights";
import { fetchLinkPreview, normalizeUrl } from "@/lib/link-preview";
import type { ActionState } from "@/app/admin/actions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** 오늘 날짜를 2026.10.30 모양으로 */
function todayText() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function refresh(slug: string) {
  revalidatePath(`/highlights/${slug}`);
}

/* ---------- 기본 항목 가져오기 ---------- */

export async function importDefaults(formData: FormData) {
  if (!(await isAdmin())) return;
  const supabase = getAdminClient();
  if (!supabase) return;

  const slug = String(formData.get("slug") ?? "");
  if (!findHighlight(slug)) return;

  // 이미 저장된 항목이 있으면 중복으로 넣지 않음
  const { count } = await supabase
    .from("highlight_entries")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);
  if (count) return;

  // 기사 주소가 있는 기본 항목은 대표사진도 함께 저장
  const entries = await fillPreviewImages(getDefaultEntries(slug));
  await supabase.from("highlight_entries").insert(entries.map((e) => ({ ...e, slug })));
  refresh(slug);
}

/* ---------- 항목 저장 (추가 / 수정) ---------- */

export async function saveEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { message: "로그인이 필요합니다. 관리자 페이지에서 로그인하세요." };

  const supabase = getAdminClient();
  if (!supabase) return { message: "Supabase가 연결되지 않았습니다. .env.local 을 확인하세요." };

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const groupHeading = String(formData.get("group_heading") ?? "");
  let date = String(formData.get("date") ?? "").trim();
  let title = String(formData.get("title") ?? "").trim();
  let note = String(formData.get("note") ?? "").trim();
  let place = String(formData.get("place") ?? "").trim();
  const linkInput = String(formData.get("link_url") ?? "").trim();
  const prevLink = String(formData.get("prev_link_url") ?? "");
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  const removeImage = formData.get("remove_image") === "on";
  const image = formData.get("image");
  const hasUpload = image instanceof File && image.size > 0;

  const highlight = findHighlight(slug);
  if (!highlight) return { message: "알 수 없는 화면입니다." };
  if (!highlight.detail.groups.some((g) => g.heading === groupHeading)) {
    return { message: "알 수 없는 묶음입니다." };
  }

  const linkUrl = linkInput ? normalizeUrl(linkInput) : null;
  if (linkInput && !linkUrl) return { message: "기사 주소는 https:// 로 시작하는 주소를 넣어 주세요." };

  // 새 기사 주소를 넣었으면 → 그 기사의 대표사진·제목·요약·날짜를 가져와 빈 칸을 채움
  let previewImage: string | null = null;
  let previewFailed = false;
  if (linkUrl && linkUrl !== prevLink) {
    const preview = await fetchLinkPreview(linkUrl);
    if (preview) {
      previewImage = preview.image;
      title ||= preview.title ?? "";
      note ||= preview.description ?? "";
      place ||= preview.siteName ?? "";
      date ||= preview.date ?? "";
    }
    previewFailed = !preview?.image;
  }
  if (linkUrl && !date) date = todayText();

  if (!date) return { message: "날짜를 입력하세요." };
  if (!title) return { message: "제목을 입력하세요. (기사에서 제목을 찾지 못했어요)" };

  const row: Record<string, unknown> = {
    slug,
    group_heading: groupHeading,
    date,
    title,
    note: note || null,
    place: place || null,
    link_url: linkUrl,
    sort_order: sortOrder,
  };

  if (previewImage && !hasUpload && !removeImage) row.image_url = previewImage;

  // 새 사진을 올린 경우 → Supabase 저장소에 업로드
  if (hasUpload) {
    if (!image.type.startsWith("image/")) return { message: "이미지 파일만 올릴 수 있습니다." };
    if (image.size > MAX_IMAGE_BYTES) return { message: "이미지는 5MB 이하만 올릴 수 있습니다." };

    const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `highlights/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });
    if (uploadError) return { message: `이미지 업로드 실패: ${uploadError.message}` };

    row.image_url = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  } else if (removeImage) {
    row.image_url = null;
  }

  const { error } = id
    ? await supabase.from("highlight_entries").update(row).eq("id", id)
    : await supabase.from("highlight_entries").insert(row);

  if (error) return { message: `저장 실패: ${error.message}` };

  refresh(slug);
  const done = id ? "수정했습니다." : "추가했습니다.";
  return {
    ok: true,
    message: previewFailed ? `${done} (기사에서 대표사진을 찾지 못했어요. 사진을 직접 올릴 수 있어요)` : done,
  };
}

/* ---------- 항목 삭제 ---------- */

export async function deleteEntry(formData: FormData) {
  if (!(await isAdmin())) return;
  const supabase = getAdminClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "");
  if (!id) return;

  await supabase.from("highlight_entries").delete().eq("id", id);

  // 직접 올린 사진이면 저장소에서도 정리 (기본 책 표지 같은 사이트 안 사진은 그대로)
  const marker = `/object/public/${IMAGE_BUCKET}/`;
  if (imageUrl.includes(marker)) {
    await supabase.storage.from(IMAGE_BUCKET).remove([imageUrl.split(marker)[1]]);
  }

  refresh(slug);
}
